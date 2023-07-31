import * as RD from '@devexperts/remote-data-ts'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { Address, isSynthAsset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { getEthAssetAddress, isEthAsset, isRuneNativeAsset } from '../../../helpers/assetHelper'
import { isEthChain } from '../../../helpers/chainHelper'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { service as midgardService } from '../../midgard/service'
import { INITIAL_SWAP_STATE, ChainTxFeeOption } from '../const'
import { SwapTxParams, SwapState, SwapState$ } from '../types'
import { sendPoolTx$, poolTxStatusByChain$ } from './common'

const { pools: midgardPoolsService, validateNode$ } = midgardService

/**
 * Swap stream does 3 steps:
 *
 * 1. Validate pool address
 * 2. Send swap transaction
 * 3. Check status of swap transaction
 *
 * @returns SwapState$ - Observable state to reflect loading status. It provides all data we do need to display status in `TxModul`
 *
 */
export const swap$ = ({
  poolAddress: poolAddresses,
  asset,
  amount,
  memo,
  walletType,
  sender,
  walletIndex,
  hdMode
}: SwapTxParams): SwapState$ => {
  // total of progress
  const total = O.some(100)
  const { chain } = asset.synth ? AssetRuneNative : asset

  // Observable state of loading process
  // we start with progress of 25%
  const {
    get$: getState$,
    get: getState,
    set: setState
  } = observableState<SwapState>({
    ...INITIAL_SWAP_STATE,
    swap: RD.progress({ loaded: 25, total })
  })

  // All requests will be done in a sequence
  // and `SwapState` will be updated step by step
  const requests$ = Rx.of(poolAddresses).pipe(
    // 1. validate pool address or node (for `RuneNative` only)
    RxOp.switchMap((poolAddresses) =>
      Rx.iif(
        () => isRuneNativeAsset(asset) || isSynthAsset(asset),
        // We don't have a RUNE pool, so we just validate current connected node
        validateNode$(),
        // in other case we have to validate pool address
        midgardPoolsService.validatePool$(poolAddresses, chain)
      )
    ),
    liveData.chain((_) => {
      setState({ ...getState(), step: 2, swapTx: RD.pending, swap: RD.progress({ loaded: 50, total }) })
      // 2. send swap tx
      return sendPoolTx$({
        walletType,
        router: poolAddresses.router, // emtpy string for RuneNative
        asset,
        recipient: poolAddresses.address, // emtpy string for RuneNative
        amount,
        memo,
        feeOption: ChainTxFeeOption.SWAP,
        sender,
        walletIndex,
        hdMode
      })
    }),
    liveData.chain((txHash) => {
      // Update state
      setState({ ...getState(), step: 3, swapTx: RD.success(txHash), swap: RD.progress({ loaded: 75, total }) })
      // 3. check tx finality by polling its tx data
      const assetAddress: O.Option<Address> =
        isEthChain(chain) && !isEthAsset(asset) ? getEthAssetAddress(asset) : O.none
      return poolTxStatusByChain$({ txHash, chain, assetAddress })
    }),
    // Update state
    liveData.map((_) => setState({ ...getState(), swap: RD.success(true) })),

    // Add failures to state
    liveData.mapLeft((apiError) => {
      setState({ ...getState(), swap: RD.failure(apiError) })
      return apiError
    }),
    // handle errors
    RxOp.catchError((error) => {
      setState({ ...getState(), swap: RD.failure(error) })
      return Rx.EMPTY
    })
  )

  // We do need to fake progress in last step
  // Note: `requests$` has to be added to subscribe it once (it won't do anything otherwise)
  return Rx.combineLatest([getState$, requests$]).pipe(
    RxOp.switchMap(([state, _]) =>
      FP.pipe(
        // check swap state to update its `pending` state (if needed)
        state.swap,
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
                  O.map(({ loaded }) => {
                    // From 75 to 97 we count progress with small steps, but stop it at 98
                    const updatedLoaded = loaded >= 75 && loaded <= 97 ? loaded++ : loaded
                    return { ...state, swap: RD.progress({ loaded: updatedLoaded, total }) }
                  }),
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
