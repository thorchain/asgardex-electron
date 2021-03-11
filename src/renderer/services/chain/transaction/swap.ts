import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { getEthAssetAddress, isRuneNativeAsset } from '../../../helpers/assetHelper'
import { isEthChain } from '../../../helpers/chainHelper'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { TxTypes } from '../../../types/asgardex'
import { service as midgardService } from '../../midgard/service'
import { INITIAL_SWAP_STATE } from '../const'
import { SwapParams, SwapState, SwapState$ } from '../types'
import { sendTx$, txStatusByChain$ } from './common'

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
export const swap$ = ({ routerAddress, poolAddress, asset, amount, memo }: SwapParams): SwapState$ => {
  // total of progress
  const total = O.some(100)

  // Observable state of loading process
  // we start with progress of 25%
  const { get$: getState$, get: getState, set: setState } = observableState<SwapState>({
    ...INITIAL_SWAP_STATE,
    swap: RD.progress({ loaded: 25, total })
  })

  // All requests will be done in a sequence
  // and `SwapState` will be updated step by step
  const requests$ = Rx.of(poolAddress).pipe(
    // 1. validate pool address or node (for `RuneNative` only)
    RxOp.switchMap((poolAddress) =>
      Rx.iif(
        () => isRuneNativeAsset(asset),
        // We don't have a RUNE pool, so we just validate current connected node
        validateNode$(),
        // in other case we have to validate pool address
        midgardPoolsService.validatePool$(poolAddress, asset.chain)
      )
    ),
    liveData.chain((_) => {
      setState({ ...getState(), step: 2, swapTx: RD.pending, swap: RD.progress({ loaded: 50, total }) })
      // 2. send swap tx
      const router = FP.pipe(routerAddress, O.toUndefined)
      return sendTx$({
        router,
        asset,
        recipient: poolAddress, // emtpy string for Native
        amount,
        memo,
        txType: TxTypes.SWAP,
        feeOptionKey: 'fastest'
      })
    }),
    liveData.chain((txHash) => {
      const assetAddress = isEthChain(asset.chain) ? FP.pipe(getEthAssetAddress(asset), O.toUndefined) : undefined
      // Update state
      setState({ ...getState(), step: 3, swapTx: RD.success(txHash), swap: RD.progress({ loaded: 75, total }) })
      // 3. check tx finality by polling its tx data
      return txStatusByChain$(txHash, asset.chain, assetAddress)
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
