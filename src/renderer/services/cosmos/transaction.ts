import * as RD from '@devexperts/remote-data-ts'
import { Client } from '@xchainjs/xchain-cosmos'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network$ } from '../app/types'
import * as C from '../clients'
import { ErrorId, TxHashLD } from '../wallet/types'
import { Client$, SendTxParams } from './types'
import { TransactionService } from './types'

export const createTransactionService = (client$: Client$, _: Network$): TransactionService => {
  const common = C.createTransactionService(client$)

  const sendTx = (params: SendTxParams): TxHashLD => {
    const { asset, recipient, amount, feeAmount, memo, walletIndex } = params
    return FP.pipe(
      client$,
      RxOp.switchMap(FP.flow(O.fold<Client, Rx.Observable<Client>>(() => Rx.EMPTY, Rx.of))),
      RxOp.switchMap((client) => Rx.from(client.transfer({ walletIndex, asset, amount, recipient, memo, feeAmount }))),
      RxOp.map(RD.success),
      RxOp.catchError(
        (e): TxHashLD =>
          Rx.of(
            RD.failure({
              msg: e?.message ?? e.toString(),
              errorId: ErrorId.SEND_TX
            })
          )
      ),
      RxOp.startWith(RD.pending)
    )
  }

  return {
    ...common,
    sendTx
  }
}
