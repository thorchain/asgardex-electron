import * as RD from '@devexperts/remote-data-ts'
import { Client as EthClient } from '@xchainjs/xchain-ethereum'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { LiveData } from '../../helpers/rx/liveData'
import * as C from '../clients'
import { ApiError, ErrorId, TxHashLD } from '../wallet/types'
import { ApproveParams, Client$, TransactionService } from './types'

export const createTransactionService = (client$: Client$): TransactionService => {
  const common = C.createTransactionService(client$)

  const runApproveERC20Token$ = (client: EthClient, params: ApproveParams): TxHashLD =>
    Rx.from(client.approve(params.spender, params.sender, params.amount)).pipe(
      RxOp.switchMap((txResult) => Rx.from(txResult.wait(1))),
      RxOp.map((txReceipt) => txReceipt.transactionHash),
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

  const approveERC20Token$ = (params: ApproveParams): TxHashLD =>
    client$.pipe(
      RxOp.switchMap((oClient) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial),
            (client) => runApproveERC20Token$(client, params)
          )
        )
      )
    )

  const runIsApprovedERC20Token$ = (client: EthClient, params: ApproveParams): LiveData<ApiError, boolean> =>
    Rx.from(client.isApproved(params.spender, params.sender, params.amount || baseAmount(0))).pipe(
      RxOp.map(RD.success),
      RxOp.catchError(
        (error): LiveData<ApiError, boolean> =>
          Rx.of(
            RD.failure({
              msg: error?.message ?? error.toString(),
              errorId: ErrorId.APPROVE_TX
            })
          )
      ),
      RxOp.startWith(RD.pending)
    )

  const isApprovedERC20Token$ = (params: ApproveParams): LiveData<ApiError, boolean> =>
    client$.pipe(
      RxOp.switchMap((oClient) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial),
            (client) => runIsApprovedERC20Token$(client, params)
          )
        )
      )
    )

  return {
    ...common,
    approveERC20Token$,
    isApprovedERC20Token$
  }
}
