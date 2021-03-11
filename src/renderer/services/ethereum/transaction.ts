import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import { Client as EthClient, ETHAddress } from '@xchainjs/xchain-ethereum'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { getEthAssetAddress } from '../../helpers/assetHelper'
import { LiveData } from '../../helpers/rx/liveData'
import * as C from '../clients'
import { ethRouterABI } from '../const'
import { ApiError, ErrorId, TxHashLD } from '../wallet/types'
import { ApproveParams, DepositParams, Client$, TransactionService, IsApprovedLD } from './types'

export const createTransactionService = (client$: Client$): TransactionService => {
  const common = C.createTransactionService(client$)

  const runSendDepositTx$ = (client: EthClient, params: DepositParams): TxHashLD => {
    // helper for failures
    const failure$ = (msg: string) =>
      Rx.of(
        RD.failure({
          errorId: ErrorId.DEPOSIT_TX,
          msg
        })
      )

    return FP.pipe(
      getEthAssetAddress(params.asset),
      O.fold(
        () => failure$('Invalid ETH or ERC20 token address'),
        (address) =>
          FP.pipe(
            Rx.from(client.estimateGasPrices()),
            RxOp.switchMap((gasPrices) => {
              const isETHAddress = address === ETHAddress
              const amount = isETHAddress ? baseAmount(0) : params.amount
              const gasPrice = gasPrices.fast.amount().toFixed()
              return Rx.from(
                // Call deposit function of Router contract
                // Note:
                // Amounts need to use `toFixed` to convert `BaseAmount` to `Bignumber`
                // since `value` and `gasPrice` type is `Bignumber`
                client.call<{ hash: TxHash }>(params.router, ethRouterABI, 'deposit', [
                  params.poolAddress,
                  address,
                  amount.amount().toFixed(),
                  params.memo,
                  isETHAddress
                    ? {
                        value: params.amount.amount().toFixed(),
                        gasPrice
                      }
                    : { gasPrice }
                ])
              )
            }),
            RxOp.map((txResult) => txResult.hash),
            RxOp.map(RD.success),
            RxOp.catchError((error): TxHashLD => failure$(error?.message ?? error.toString())),
            RxOp.startWith(RD.pending)
          )
      )
    )
  }

  const sendDepositTx$ = (params: DepositParams): TxHashLD =>
    client$.pipe(
      RxOp.switchMap((oClient) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial),
            (client) => runSendDepositTx$(client, params)
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
        (error): TxHashLD =>
          Rx.of(
            RD.failure({
              msg: error?.message ?? error.toString(),
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
    Rx.from(client.isApproved(params.spender, params.sender, params.amount || baseAmount('1'))).pipe(
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

  const isApprovedERC20Token$ = (params: ApproveParams): IsApprovedLD =>
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
    sendDepositTx$,
    approveERC20Token$,
    isApprovedERC20Token$
  }
}
