import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { ErrorId } from '../../wallet/types'
import { INITIAL_SEND_STATE } from '../const'
import { SendTxStateHandler, SendTxState } from '../types'
import { sendTx$ } from './common'

/**
 * Send TX
 */
export const transfer$: SendTxStateHandler = (params) => {
  // total of progress
  const total = O.some(100)
  // Observable state of `SendTxState`
  const {
    get$: getState$,
    get: getState,
    set: setState
  } = observableState<SendTxState>({
    ...INITIAL_SEND_STATE,
    status: RD.progress({ loaded: 75, total }),
    steps: { current: 1, total: 1 }
  })

  const requests$ = FP.pipe(
    sendTx$(params),
    // Update state
    liveData.map((txHash) => setState({ ...getState(), status: RD.success(txHash) })),
    // Add failures to state
    liveData.mapLeft((apiError) => {
      setState({ ...getState(), status: RD.failure(apiError) })
      return apiError
    }),
    // handle errors
    RxOp.catchError((error) => {
      setState({
        ...getState(),
        status: RD.failure({
          errorId: ErrorId.SEND_TX,
          msg: error?.msg ?? error.toString()
        })
      })
      return Rx.EMPTY
    })
  )

  return FP.pipe(
    Rx.combineLatest([getState$, requests$]),
    RxOp.switchMap(() => Rx.of(getState()))
  )
}
