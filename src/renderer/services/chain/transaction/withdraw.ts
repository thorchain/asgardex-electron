import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { getEthAssetAddress, isRuneNativeAsset } from '../../../helpers/assetHelper'
import { isEthChain } from '../../../helpers/chainHelper'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { service as midgardService } from '../../midgard/service'
import { INITIAL_WITHDRAW_STATE, FeeOptionKeys } from '../const'
import { WithdrawParams, WithdrawState, WithdrawState$ } from '../types'
import { sendTx$, poolTxStatusByChain$ } from './common'
import { smallestAmountToSent } from './transaction.helper'

const { pools: midgardPoolsService, validateNode$ } = midgardService

/**
 * Symetrical withdraw stream does 3 steps:
 *
 * 1. Validate pool address + node
 * 2. Send withdraw transaction
 * 3. Check status of both transactions
 *
 * @returns WithdrawState$ - Observable state to reflect loading status. It provides all data we do need to display status in `TxModal`
 *
 */
export const withdraw$ = ({ poolAddress, asset, memo, network }: WithdrawParams): WithdrawState$ => {
  // total of progress
  const total = O.some(100)

  // Observable state of to reflect status of all needed steps
  const { get$: getState$, get: getState, set: setState } = observableState<WithdrawState>({
    ...INITIAL_WITHDRAW_STATE,
    withdrawTx: RD.pending,
    // we start with  a small progress
    withdraw: RD.progress({ loaded: 25, total })
  })

  const isRune = isRuneNativeAsset(asset)

  // All requests will be done in a sequence
  // to update `SymWithdrawState` step by step
  const requests$ = Rx.of(poolAddress).pipe(
    // 1. validate pool address or node
    RxOp.switchMap((poolAddresses) =>
      Rx.iif(
        () => isRuneNativeAsset(asset),
        // We don't have a RUNE pool, so we just validate current connected node
        validateNode$(),
        // in other case we have to validate pool address
        midgardPoolsService.validatePool$(poolAddresses, asset.chain)
      )
    ),
    // 2. send RUNE withdraw txs
    liveData.chain((_) => {
      setState({ ...getState(), step: 2, withdraw: RD.progress({ loaded: 50, total }) })
      return sendTx$({
        asset,
        recipient: isRune ? '' : poolAddress.address,
        amount: smallestAmountToSent(asset.chain, network),
        memo,
        feeOptionKey: FeeOptionKeys.WITHDRAW
      })
    }),
    liveData.chain((txHash) => {
      // Update state
      setState({
        ...getState(),
        step: 3,
        withdraw: RD.progress({ loaded: 75, total }),
        withdrawTx: RD.success(txHash)
      })
      // 3. check tx finality by polling its tx data
      const assetAddress: O.Option<Address> = isEthChain(asset.chain) ? getEthAssetAddress(asset) : O.none
      return poolTxStatusByChain$({ txHash, chain: asset.chain, assetAddress })
    }),
    liveData.map((_) => setState({ ...getState(), withdraw: RD.success(true) })),
    // Add failures to state
    liveData.mapLeft((apiError) => {
      setState({ ...getState(), withdraw: RD.failure(apiError) })
      return apiError
    }),
    // handle errors
    RxOp.catchError((error) => {
      setState({ ...getState(), withdraw: RD.failure(error) })
      return Rx.EMPTY
    })
  )

  // We do need to fake progress in last step
  // Note: `requests$` has to be added to subscribe it once (it won't do anything otherwise)
  return Rx.combineLatest([getState$, requests$]).pipe(
    RxOp.switchMap(([state, _]) =>
      FP.pipe(
        // check withdraw state to update its `pending` state (if needed)
        state.withdraw,
        RD.fold(
          // ignore initial state + return same state (no changes)
          () => Rx.of(state),
          // For `pending` state we fake progress state in last third
          (oProgress) =>
            FP.pipe(
              // Just a timer used to update loaded state (in pending state only)
              Rx.interval(1500),
              RxOp.map(() =>
                FP.pipe(
                  oProgress,
                  O.map(
                    ({ loaded }): WithdrawState => {
                      // From 75 to 97 we count progress with small steps, but stop it at 98
                      const updatedLoaded = loaded >= 75 && loaded <= 97 ? loaded++ : loaded
                      return { ...state, withdraw: RD.progress({ loaded: updatedLoaded, total }) }
                    }
                  ),
                  O.getOrElse(() => state)
                )
              )
            ),
          // ignore `failure` state + return same state (no changes)
          () => Rx.of(state),
          // ignore `success` state + return same state (no changes)
          () => Rx.of(state)
        )
      )
    ),
    RxOp.startWith({ ...getState() })
  )
}
