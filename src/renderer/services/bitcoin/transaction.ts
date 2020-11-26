import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import * as C from '../clients'
import { ApiError, ErrorId, TxRD, TxLD } from '../wallet/types'
import { SendTxParams, TransactionService, Client$ } from './types'

const { get$: txRD$, set: setTxRD } = observableState<TxRD>(RD.initial)

const tx$ = ({ client$, to, amount, feeRate, memo }: { client$: Client$ } & SendTxParams): TxLD =>
  client$.pipe(
    switchMap((oClient) => (O.isSome(oClient) ? Rx.of(oClient.value) : Rx.EMPTY)),
    switchMap((client) => Rx.from(client.transfer({ recipient: to, amount, memo, feeRate }))),
    map(RD.success),
    catchError((error) =>
      Rx.of(
        RD.failure({
          errorId: ErrorId.SEND_TX,
          msg: error?.msg ?? error?.toString() ?? `Sending tx to ${to} failed`
        } as ApiError)
      )
    ),
    startWith(RD.pending)
  )

const pushTx = (client$: Client$) => ({ to, amount, feeRate, memo }: SendTxParams) =>
  tx$({ client$, to, amount, feeRate, memo }).subscribe(setTxRD)

const sendStakeTx = (client$: Client$) => ({ to, amount, feeRate, memo }: SendTxParams) =>
  tx$({ client$, to, amount, feeRate, memo })

const createTransactionService = (client$: Client$): TransactionService => ({
  txRD$,
  pushTx: pushTx(client$),
  sendStakeTx: sendStakeTx(client$),
  txs$: C.txs$(client$),
  resetTx: () => setTxRD(RD.initial)
})

export { createTransactionService }
