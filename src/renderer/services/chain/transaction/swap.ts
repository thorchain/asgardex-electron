import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { TxTypes } from '../../../types/asgardex'
import { service as midgardService } from '../../midgard/service'
import { INITIAL_SWAP_TX_STATE } from '../const'
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
export const swap$ = ({ poolAddress, asset, amount, memo }: SwapParams): SwapState$ => {
  // Observable state of loading process
  const { get$: getState$, get: getState, set: setState } = observableState<SwapState>(INITIAL_SWAP_TX_STATE)

  // total of progress
  const total = O.some(100)

  Rx.of(poolAddress).pipe(
    // Update progress
    RxOp.tap(() =>
      setState({ ...getState(), startTime: O.some(Date.now()), txRD: RD.progress({ loaded: 10, total }) })
    ),
    // 1. validate pool address
    RxOp.switchMap(midgardPoolsService.validatePool$),
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
    liveData.map((txHash) => setState({ ...getState(), txHash, txRD: RD.success(O.getOrElse(() => '')(txHash)) })),
    // handle errors
    RxOp.catchError((error) => {
      setState({ ...getState(), txRD: RD.failure(error) })
      return Rx.EMPTY
    })
  )

  // timer to update loaded state
  const timer$ = Rx.timer(1500)

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
