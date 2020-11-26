import * as RD from '@devexperts/remote-data-ts'
import { assetToBase } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import * as C from '../clients'
import { TxRD, TxLD } from '../wallet/types'
import { Client$, SendTxParams, TransactionService } from './types'

const { get$: txRD$, set: setTxRD } = observableState<TxRD>(RD.initial)

const tx$ = ({ client$, to, amount, asset, memo }: { client$: Client$ } & SendTxParams): TxLD =>
  client$.pipe(
    switchMap((oClient) => (O.isSome(oClient) ? Rx.of(oClient.value) : Rx.EMPTY)),
    switchMap((client) =>
      Rx.from(
        client.transfer({
          asset,
          amount: assetToBase(amount),
          recipient: to,
          memo
        })
      )
    ),
    map(RD.success),
    startWith(RD.pending)
  )

const pushTx = (client$: Client$) => ({ to, amount, asset, memo }: SendTxParams): Rx.Subscription =>
  tx$({ client$, to, amount, asset, memo }).subscribe(setTxRD)

const sendStakeTx = (client$: Client$) => ({ to, amount, asset, memo }: SendTxParams): TxLD =>
  tx$({ client$, to, amount, asset, memo })

export const createTransactionService = (client$: Client$): TransactionService => {
  return {
    txRD$,
    pushTx: pushTx(client$),
    sendStakeTx: sendStakeTx(client$),
    txs$: C.txs$(client$),
    resetTx: () => setTxRD(RD.initial)
  }
}
