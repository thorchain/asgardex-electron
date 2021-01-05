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
  // Observable state of loading process
  const { get$: getState$, get: getState, set: setState } = observableState<SwapState>(INITIAL_SWAP_STATE)

  // total of progress
  const total = O.some(100)

  FP.pipe(
    oPoolAddress,
    // For RuneNative we send `MsgNativeTx` w/o need for a pool address address,
    // so we can leave it empty
    O.alt(() => (isRuneNativeAsset(asset) ? O.some('') : O.none)),
    O.fold(
      // invalid pool address will fail
      () => setState({ ...getState(), txRD: RD.failure({ errorId: ErrorId.SEND_TX, msg: 'invalid pool address' }) }),
      // valid pool address (even an empty one for Thorchain)
      (poolAddress) => {
        Rx.of(poolAddress).pipe(
          // Update progress
          RxOp.tap(() => setState({ ...getState(), txRD: RD.progress({ loaded: 10, total }) })),
          // 1. validate pool address or node (for `RuneNative` only)
          RxOp.switchMap((p) =>
            Rx.iif(
              () => isRuneNativeAsset(asset),
              midgardPoolsService.validateNode$(),
              midgardPoolsService.validatePool$(p)
            )
          ),
          // Update progress
          RxOp.tap(() => setState({ ...getState(), txRD: RD.progress({ loaded: 33, total }) })),
          // 2. send swap tx
          RxOp.switchMap(() => sendTx$({ asset, recipient: poolAddress, amount, memo, txType: TxTypes.SWAP })),
          // Update state
          liveData.map((txHash) => {
            setState({ ...getState(), txHash: O.some(txHash), txRD: RD.progress({ loaded: 66, total }) })
            return txHash
          }),
          // 3. check tx finality via midgard (not implemented yet)
          liveData.chain(midgardTxStatus$),
          // Update state
          liveData.map((txHash) =>
            setState({ ...getState(), txHash, txRD: RD.success(O.getOrElse(() => '')(txHash)) })
          ),
          // handle errors
          RxOp.catchError((error) => {
            setState({ ...getState(), txRD: RD.failure(error) })
            return Rx.EMPTY
          })
        )
      }
    )
  )

  // timer to update loaded state (in pending state only)
  const timer$ = Rx.timer(1500).pipe(RxOp.filter(() => RD.isPending(getState().txRD)))

  // Return stream of `SwapState$` depending on state updates and timer
  return Rx.combineLatest([getState$, timer$]).pipe(
    RxOp.switchMap(([state, _]) =>
      Rx.of(
        FP.pipe(
          state.txRD,
          RD.fold(
            () => state,
            (oProgress) =>
              // fake progress state in last third
              FP.pipe(
                oProgress,
                O.map(({ loaded }) => {
                  // From 66 to 97 we count progress with small steps, but stop it at 98
                  const updatedLoaded = loaded >= 66 && loaded <= 97 ? loaded++ : loaded
                  return { ...state, txRD: RD.progress({ loaded: updatedLoaded, total }) }
                }),
                O.getOrElse(() => state)
              ),
            () => state,
            () => state
          )
        )
      )
    )
  )
}
