import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@xchainjs/xchain-bitcoin'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { ApiError, TxsPageLD, ErrorId, TxRD, LoadTxsProps } from '../wallet/types'
import { Client$ } from './common'
import { SendTxParams, TransactionService } from './types'

const { get$: txRD$, set: setTxRD } = observableState<TxRD>(RD.initial)

const tx$ = ({ client$, to, amount, feeRate, memo }: { client$: Client$ } & SendTxParams): Rx.Observable<TxRD> =>
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

/**
 * Observable to load txs
 * If client is not available, it returns an `initial` state
 */
const loadTxs$ = ({ client, limit, offset }: { client: BitcoinClient; limit: number; offset: number }): TxsPageLD => {
  const address = client.getAddress()
  return Rx.from(client.getTransactions({ address, limit, offset })).pipe(
    map(RD.success),
    catchError((error) =>
      Rx.of(RD.failure({ errorId: ErrorId.GET_ASSET_TXS, msg: error?.message ?? error.toString() } as ApiError))
    ),
    startWith(RD.pending)
  )
}

/**
 * `Txs` history for BTC
 */
const txs$ = (client$: Client$) => ({ limit, offset }: LoadTxsProps): TxsPageLD =>
  client$.pipe(
    switchMap((client) =>
      FP.pipe(
        client,
        O.fold(
          () => Rx.of(RD.initial),
          (clientState) =>
            loadTxs$({
              client: clientState,
              limit,
              offset
            })
        )
      )
    )
  )

const createTransactionService = (client$: Client$): TransactionService => ({
  txRD$,
  pushTx: pushTx(client$),
  sendStakeTx: sendStakeTx(client$),
  txs$: txs$(client$),
  resetTx: () => setTxRD(RD.initial)
})

export { createTransactionService }
