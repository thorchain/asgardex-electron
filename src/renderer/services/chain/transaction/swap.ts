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
import { INITIAL_SWAP_STATE } from '../const'
import { SwapParams, SwapState, SwapState$ } from '../types'
import { sendTx$ } from './common'

const { pools: midgardPoolsService, txStatus$: midgardTxStatus$ } = midgardService

/**
 * Swap stream does 3 steps:
 *
 * 1. Validate pool address
 * 2. Send swap transaction
 * 3. Check status of swap transaction
 *
 * @returns SwapTxState$ - Observable state to reflect loading status. It provides all data we do need to display status in `TxModul`
 *
 */
export const swap$ = ({ poolAddress: oPoolAddress, asset, amount, memo }: SwapParams): SwapState$ => {
  // total of progress
  const total = O.some(100)

  // Observable state of loading process
  // we start with progress of 25%
  const { get$: getState$, get: getState, set: setState } = observableState<SwapState>({
    ...INITIAL_SWAP_STATE,
    txRD: RD.progress({ loaded: 25, total })
  })

  // All requests will be done in a sequence
  // and `SwapState` will be updated step by step
  const requests$ = FP.pipe(
    oPoolAddress,
    // For RuneNative we send `MsgNativeTx` w/o need for a pool address address,
    // so we can leave it empty
    O.alt(() => (isRuneNativeAsset(asset) ? O.some('') : O.none)),

    O.fold(
      // invalid pool address will fail
      () => {
        setState({ ...getState(), txRD: RD.failure({ errorId: ErrorId.SEND_TX, msg: 'invalid pool address' }) })
        return Rx.EMPTY
      },
      // valid pool address (even an empty one for Thorchain)
      (poolAddress) =>
        Rx.of(poolAddress).pipe(
          // 1. validate pool address or node (for `RuneNative` only)
          RxOp.switchMap((poolAddress) =>
            Rx.iif(
              () => isRuneNativeAsset(asset),
              midgardPoolsService.validateNode$(),
              midgardPoolsService.validatePool$(poolAddress)
            )
          ),
          // Update progress
          liveData.chain((_) => {
            setState({ ...getState(), step: 2, txRD: RD.progress({ loaded: 50, total }) })
            // 2. send swap tx
            return sendTx$({
              asset,
              recipient: poolAddress,
              amount,
              memo,
              txType: TxTypes.SWAP,
              feeOptionKey: 'fastest'
            })
          }),
          liveData.chain((txHash) => {
            // Update state
            setState({ ...getState(), step: 3, txHash: O.some(txHash), txRD: RD.progress({ loaded: 75, total }) })
            // 3. check tx finality via midgard (not implemented yet)
            return midgardTxStatus$(txHash)
          }),
          // Update state
          liveData.map((txHash) =>
            setState({ ...getState(), txHash, txRD: RD.success(O.getOrElse(() => '')(txHash)) })
          ),
          // Add failures to state
          liveData.mapLeft((apiError) => {
            setState({ ...getState(), txRD: RD.failure(apiError) })
            return apiError
          }),
          // handle errors
          RxOp.catchError((error) => {
            setState({ ...getState(), txRD: RD.failure(error) })
            return Rx.EMPTY
          })
        )
    )
  )

  // Just a timer used to update loaded state (in pending state only)
  const timer$ = Rx.timer(1500).pipe(RxOp.filter(() => RD.isPending(getState().txRD)))

  // We do need to fake progress in last step
  // That's we combine streams `getState$` (state updates) and `timer$` (counter)
  // Note: `requests$` has to be added to subscribe it once only (it won't do anything otherwise)
  return Rx.combineLatest([getState$, timer$, requests$]).pipe(
    RxOp.switchMap(([state]) =>
      Rx.of(
        FP.pipe(
          state.txRD,
          RD.fold(
            // ignore initial state + return same state (no changes)
            () => state,
            // For `pending` we fake progress state in last third
            (oProgress) =>
              FP.pipe(
                oProgress,
                O.map(({ loaded }) => {
                  // From 66 to 97 we count progress with small steps, but stop it at 98
                  const updatedLoaded = loaded >= 75 && loaded <= 97 ? loaded++ : loaded
                  return { ...state, txRD: RD.progress({ loaded: updatedLoaded, total }) }
                }),
                O.getOrElse(() => state)
              ),
            // ignore `failure` state + return same state (no changes)
            () => state,
            // ignore `success` state + return same state (no changes)
            () => state
          )
        )
      )
    ),
    RxOp.startWith({ ...getState() })
  )
}
