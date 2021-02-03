import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { isRuneNativeAsset } from '../../../helpers/assetHelper'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { TxTypes } from '../../../types/asgardex'
import { service as midgardService } from '../../midgard/service'
import { ErrorId } from '../../wallet/types'
import { INITIAL_WITHDRAW_STATE } from '../const'
import { WithdrawParams, WithdrawState, WithdrawState$ } from '../types'
import { txStatusByChain$, sendTx$ } from './common'
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
export const withdraw$ = ({ poolAddress: oPoolAddress, asset, memo, network }: WithdrawParams): WithdrawState$ => {
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
  const requests$ = FP.pipe(
    oPoolAddress,
    // For RuneNative we send `MsgNativeTx` w/o need for a pool address address,
    // so we can leave it empty
    O.alt(() => (isRune ? O.some('') : O.none)),
    O.fold(
      // invalid pool address will fail
      () => {
        // TODO(@Veado) Add i18n
        setState({ ...getState(), withdraw: RD.failure({ errorId: ErrorId.SEND_TX, msg: 'invalid pool address' }) })
        return Rx.EMPTY
      },
      // continue with a pool address (even an empty one for Thorchain)
      (poolAddress) =>
        Rx.of(poolAddress).pipe(
          // 1. validate pool address or node
          RxOp.switchMap((poolAddress) =>
            Rx.iif(
              () => isRuneNativeAsset(asset),
              // We don't have a RUNE pool, so we just validate current connected node
              validateNode$(),
              // in other case we have to validate pool address
              midgardPoolsService.validatePool$(poolAddress, asset.chain)
            )
          ),
          // 2. send RUNE witdraw txs
          liveData.chain((_) => {
            setState({ ...getState(), step: 2, withdraw: RD.progress({ loaded: 50, total }) })
            return sendTx$({
              asset,
              recipient: isRune ? '' : poolAddress,
              amount: smallestAmountToSent(asset.chain, network),
              memo,
              txType: TxTypes.WITHDRAW,
              feeOptionKey: 'fastest'
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
            return txStatusByChain$(txHash, asset.chain)
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
    )
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
