import * as RD from '@devexperts/remote-data-ts'
import { Client } from '@xchainjs/xchain-terra'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import * as C from '../clients'
import { ErrorId, TxHashLD } from '../wallet/types'
import { Client$, SendTxParams } from './types'
import { TransactionService } from './types'

export const createTransactionService = (client$: Client$): TransactionService => {
  const common = C.createTransactionService(client$)

  const sendTx = (params: SendTxParams): TxHashLD => {
    const { asset, recipient, amount, feeAsset, feeAmount, gasLimit, memo, walletIndex } = params
    const estimatedFee = { asset: feeAsset, amount: feeAmount, gasLimit }

    return FP.pipe(
      client$,
      RxOp.switchMap(FP.flow(O.fold<Client, Rx.Observable<Client>>(() => Rx.EMPTY, Rx.of))),
      RxOp.switchMap((client) =>
        Rx.from(client.transfer({ walletIndex, asset, amount, recipient, memo, estimatedFee }))
      ),
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
    /* common.sendTx is overridden here  */
    sendTx
  }
}
