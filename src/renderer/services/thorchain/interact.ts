import * as RD from '@devexperts/remote-data-ts'
import { DepositParam } from '@xchainjs/xchain-thorchain'
import { AssetRuneNative, Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { liveData } from '../../helpers/rx/liveData'
import { LiveData } from '../../helpers/rx/liveData'
import { observableState } from '../../helpers/stateHelper'
import { TxLD } from '../wallet/types'
import { ApiError } from '../wallet/types'
import { INITIAL_INTERACT_STATE } from './const'
import { InteractParams, InteractState, InteractState$ } from './types'

/**
 * Interact stream does 2 steps:
 *
 * 1. Send deposit transaction
 * 2. Check status of deposit transaction
 *
 * @returns InteractState$ - Observable state to reflect loading status. It provides all data we do need to display
 *
 */
export const createInteractService$ = (sendTx$: (_: DepositParam) => LiveData<ApiError, string>) => (
  getTxStatus: (txHash: string, chain: Chain) => TxLD
) => ({ amount, memo }: InteractParams): InteractState$ => {
  // total of progress
  const total = O.some(100)

  // Observable state of loading process
  // we start with progress of 33%
  const { get$: getState$, get: getState, set: setState } = observableState<InteractState>({
    ...INITIAL_INTERACT_STATE,
    txRD: RD.progress({ loaded: 33, total })
  })

  // All requests will be done in a sequence
  // and `InteractState` will be updated step by step
  const requests$ = FP.pipe(
    // 1. send deposit tx
    sendTx$({
      asset: AssetRuneNative,
      amount,
      memo
    }),
    liveData.chain((txHash) => {
      // Update state
      setState({ ...getState(), step: 2, txRD: RD.progress({ loaded: 66, total }) })
      // 2. check tx finality via midgard (not implemented yet)
      return getTxStatus(txHash, AssetRuneNative.chain)
    }),
    // Update state
    liveData.map(({ hash: txHash }) => setState({ ...getState(), txRD: RD.success(txHash) })),
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

  // We do need to fake progress in last step
  // That's we combine streams `getState$` (state updates) and `timer$` (counter)
  // Note: `requests$` has to be added to subscribe it once only (it won't do anything otherwise)
  return Rx.combineLatest([getState$, requests$]).pipe(
    RxOp.map(([state]) =>
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
                const updatedLoaded = loaded >= 66 && loaded <= 97 ? loaded++ : loaded
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
    ),
    RxOp.startWith({ ...getState() })
  )
}
