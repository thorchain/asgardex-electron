import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import { Client as EthClient, ETHAddress } from '@xchainjs/xchain-ethereum'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { LiveData } from '../../helpers/rx/liveData'
import * as C from '../clients'
import { ethRouterABI } from '../const'
import { ApiError, ErrorId, TxHashLD } from '../wallet/types'
import { ApproveParams, CallRouterParams, Client$, TransactionService } from './types'

export const createTransactionService = (client$: Client$): TransactionService => {
  const common = C.createTransactionService(client$)

  const runCallRouterDeposit$ = (client: EthClient, params: CallRouterParams): TxHashLD =>
    FP.pipe(
      Rx.from(client.estimateGasPrices()),
      RxOp.switchMap((gasPrices) => {
        const amount = params.assetAddress === ETHAddress ? baseAmount(0) : params.amount
        return client.call<{ hash: TxHash }>(params.router, ethRouterABI, 'deposit', [
          params.vault,
          params.assetAddress,
          amount,
          params.memo,
          params.assetAddress === ETHAddress
            ? {
                value: params.amount,
                gasPrice: gasPrices.fastest
              }
            : { gasPrice: gasPrices.fastest }
        ])
      }),
      RxOp.map((txResult) => txResult.hash),
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

  const callRouterDeposit$ = (params: CallRouterParams): TxHashLD =>
    client$.pipe(
      RxOp.switchMap((oClient) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial),
            (client) => runCallRouterDeposit$(client, params)
          )
        )
      )
    )

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

  const sendDepositTx = (params: CallRouterParams): TxHashLD => callRouterDeposit$(params)

  return {
    ...common,
    sendDepositTx,
    approveERC20Token$,
    isApprovedERC20Token$
  }
}
