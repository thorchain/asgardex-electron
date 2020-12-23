import * as RD from '@devexperts/remote-data-ts'
import { DepositParam } from '@xchainjs/xchain-thorchain'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import * as C from '../clients'
import { TxLD, ErrorId } from '../wallet/types'
import { Client$ } from './types'
import { TransactionService } from './types'

export const createTransactionService: (client$: Client$) => TransactionService = C.transactionServiceFactory

export const createDepositService = (client$: Client$) => {
  const tx$ = (params: DepositParam): TxLD =>
    client$.pipe(
      RxOp.switchMap((oClient) => (O.isSome(oClient) ? Rx.of(oClient.value) : Rx.EMPTY)),
      RxOp.switchMap((client) => Rx.from(client.deposit(params))),
      RxOp.map(RD.success),
      RxOp.catchError(
        (e): TxLD =>
          Rx.of(
            RD.failure({
              msg: e.toString(),
              errorId: ErrorId.SEND_TX
            })
          )
      ),
      RxOp.startWith(RD.pending)
    )

  /**
   * Sends a deposit request by given `DepositParam`
   */
  const sendTx = (params: DepositParam): TxLD => tx$(params)

  return {
    sendTx
  }
}
