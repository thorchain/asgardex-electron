import * as RD from '@devexperts/remote-data-ts'
import { DepositParam } from '@xchainjs/xchain-thorchain'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import * as C from '../clients'
import { TxHashLD, ErrorId } from '../wallet/types'
import { Client$ } from './types'
import { TransactionService } from './types'

export const createTransactionService = (client$: Client$): TransactionService => {
  const common = C.createTransactionService(client$)
  /**
   * Sends a deposit request by given `DepositParam`
   */
  const sendPoolTx = (params: DepositParam): TxHashLD =>
    client$.pipe(
      RxOp.switchMap((oClient) => (O.isSome(oClient) ? Rx.of(oClient.value) : Rx.EMPTY)),
      RxOp.switchMap((client) => Rx.from(client.deposit(params))),
      RxOp.map(RD.success),
      RxOp.catchError(
        (e): TxHashLD =>
          Rx.of(
            RD.failure({
              msg: e.toString(),
              errorId: ErrorId.SEND_TX
            })
          )
      ),
      RxOp.startWith(RD.pending)
    )

  return {
    ...common,
    sendPoolTx$: sendPoolTx
  }
}
