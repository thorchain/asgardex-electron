import * as RD from '@devexperts/remote-data-ts'
import { Client } from '@xchainjs/xchain-mayachain'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network$ } from '../app/types'
import * as C from '../clients'
import { ErrorId, TxHashLD } from '../wallet/types'
import { Client$, SendTxParams } from './types'
import { TransactionService } from './types'

export const createTransactionService = (client$: Client$, network$?: Network$): TransactionService => {
  const common = C.createTransactionService(client$)

  // get around elint error as network is not required for Maya
  const a = network$
  network$ = a

  const sendKeystoreTx = (params: SendTxParams): TxHashLD => {
    const { asset, recipient, amount, memo, walletIndex } = params
    return FP.pipe(
      client$,
      RxOp.switchMap(FP.flow(O.fold<Client, Rx.Observable<Client>>(() => Rx.EMPTY, Rx.of))),
      RxOp.switchMap((client) => Rx.from(client.transfer({ walletIndex, asset, amount, recipient, memo }))),
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

  // no ledger support
  const sendTx = (params: SendTxParams) => {
    return sendKeystoreTx(params)
  }

  return {
    ...common,
    sendTx
  }
}
