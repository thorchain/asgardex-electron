import * as RD from '@devexperts/remote-data-ts'
import { baseAmount } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { LiveData } from '../../helpers/rx/liveData'
import * as C from '../clients'
import { ApiError, ErrorId, TxHashLD } from '../wallet/types'
import { ApproveParams, Client$, TransactionService } from './types'

export const createTransactionService: (client$: Client$) => TransactionService = C.createTransactionService

export const createApproveService = (client$: Client$) => {
  const approve$ = (params: ApproveParams): TxHashLD =>
    client$.pipe(
      RxOp.switchMap((oClient) => (O.isSome(oClient) ? Rx.of(oClient.value) : Rx.EMPTY)),
      RxOp.switchMap((client) => Rx.from(client.approve(params.spender, params.sender, params.amount))),
      RxOp.switchMap((txResult) => Rx.from(txResult.wait(1))),
      RxOp.switchMap((txReceipt) => txReceipt.transactionHash),
      RxOp.map(RD.success),
      RxOp.catchError(
        (e): TxHashLD =>
          Rx.of(
            RD.failure({
              msg: e.toString(),
              errorId: ErrorId.APPROVE_TX
            })
          )
      ),
      RxOp.startWith(RD.pending)
    )

  const isApproved$ = (params: ApproveParams): LiveData<ApiError, boolean> =>
    client$.pipe(
      RxOp.switchMap((oClient) => (O.isSome(oClient) ? Rx.of(oClient.value) : Rx.EMPTY)),
      RxOp.switchMap((client) =>
        Rx.from(client.isApproved(params.spender, params.sender, params.amount || baseAmount(0)))
      ),
      RxOp.map(RD.success),
      RxOp.catchError(
        (e): LiveData<ApiError, boolean> =>
          Rx.of(
            RD.failure({
              msg: e.toString(),
              errorId: ErrorId.APPROVE_TX
            })
          )
      ),
      RxOp.startWith(RD.pending)
    )

  const approveERC20Token = (params: ApproveParams): TxHashLD => approve$(params)
  const isApprovedERC20Token = (params: ApproveParams): LiveData<ApiError, boolean> => isApproved$(params)

  return {
    approveERC20Token,
    isApprovedERC20Token
  }
}
