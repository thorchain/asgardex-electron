import * as RD from '@devexperts/remote-data-ts'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { INITIAL_SEND_STATE } from '../const'
import { SendTxParams, SendTxState, SendTxState$ } from '../types'
import { sendTx$, txStatusByChain$ } from './common'

/**
 * Send TX
 */
export const transfer$ = (params: SendTxParams): SendTxState$ => {
  // Observable state of `SendTxState`
  const { get$: getState$, get: getState, set: setState } = observableState<SendTxState>({
    ...INITIAL_SEND_STATE,
    status: RD.pending,
    steps: { current: 1, total: 2 }
  })

  // All requests will be done in a sequence
  // to update `SendTxState` step by step
  const requests$ = sendTx$(params).pipe(
    liveData.chain((txHash) => {
      // Update state
      setState({
        ...getState(),
        steps: { current: 2, total: 2 }
      })
      // 2. check tx finality by polling its tx data
      return txStatusByChain$(txHash, params.asset.chain)
    }),
    // Update state
    liveData.map(({ hash }) => setState({ ...getState(), status: RD.success(hash) })),
    // Add failures to state
    liveData.mapLeft((apiError) => {
      setState({ ...getState(), status: RD.failure(apiError) })
      return apiError
    }),
    // handle errors
    RxOp.catchError((error) => {
      setState({ ...getState(), status: RD.failure(error) })
      return Rx.EMPTY
    })
  )

  return Rx.combineLatest([getState$, requests$]).pipe(RxOp.switchMap(() => Rx.of(getState())))
}
