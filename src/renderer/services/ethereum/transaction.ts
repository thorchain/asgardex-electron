import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import { ETHAddress } from '@xchainjs/xchain-ethereum'
import { baseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { getEthAssetAddress } from '../../helpers/assetHelper'
import { sequenceSOption } from '../../helpers/fpHelpers'
import { LiveData } from '../../helpers/rx/liveData'
import { SendPoolTxParams } from '../chain/types'
import * as C from '../clients'
import { ethRouterABI } from '../const'
import { ApiError, ErrorId, TxHashLD } from '../wallet/types'
import { ApproveParams, Client$, Client as EthClient, TransactionService, IsApprovedLD } from './types'

export const createTransactionService = (client$: Client$): TransactionService => {
  const common = C.createTransactionService(client$)

  const runSendPoolTx$ = (client: EthClient, { walletIndex, ...params }: SendPoolTxParams): TxHashLD => {
    // helper for failures
    const failure$ = (msg: string) =>
      Rx.of(
        RD.failure({
          errorId: ErrorId.POOL_TX,
          msg
        })
      )

    return FP.pipe(
      sequenceSOption({ address: getEthAssetAddress(params.asset), router: params.router }),
      O.fold(
        () => failure$(`Invalid values: Asset ${params.asset} / router address ${params.router}`),
        ({ address, router }) =>
          FP.pipe(
            Rx.from(client.estimateGasPrices()),
            RxOp.switchMap((gasPrices) => {
              const isETHAddress = address === ETHAddress
              const amount = isETHAddress ? baseAmount(0) : params.amount
              const gasPrice = gasPrices.fast.amount().toFixed(0) // no round down needed
              return Rx.from(
                // Call deposit function of Router contract
                // Note:
                // Amounts need to use `toFixed` to convert `BaseAmount` to `Bignumber`
                // since `value` and `gasPrice` type is `Bignumber`
                client.call<{ hash: TxHash }>({
                  walletIndex,
                  contractAddress: router,
                  abi: ethRouterABI,
                  funcName: 'deposit',
                  funcParams: [
                    params.recipient,
                    address,
                    // Send `BaseAmount` w/o decimal and always round down for currencies
                    amount.amount().toFixed(0, BigNumber.ROUND_DOWN),
                    params.memo,
                    isETHAddress
                      ? {
                          // Send `BaseAmount` w/o decimal and always round down for currencies
                          value: params.amount.amount().toFixed(0, BigNumber.ROUND_DOWN),
                          gasPrice
                        }
                      : { gasPrice }
                  ]
                })
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

  const sendPoolTx$ = (params: SendPoolTxParams): TxHashLD =>
    client$.pipe(
      RxOp.switchMap((oClient) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial),
            (client) => runSendPoolTx$(client, params)
          )
        )
      )
    )

  const runApproveERC20Token$ = (client: EthClient, { ...params }: ApproveParams): TxHashLD =>
    Rx.from(
      client.approve({
        ...params,
        walletIndex: 0,
        feeOptionKey: 'fast',
        gasLimitFallback: '65000'
      })
    ).pipe(
      RxOp.switchMap((txResult) => Rx.from(txResult.wait(1))),
      RxOp.map(({ transactionHash }) => transactionHash),
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

  const runIsApprovedERC20Token$ = (
    client: EthClient,
    { contractAddress, spenderAddress, amount }: ApproveParams
  ): LiveData<ApiError, boolean> =>
    FP.pipe(
      Rx.from(client.isApproved({ contractAddress, spenderAddress, amount })),
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
    sendPoolTx$,
    approveERC20Token$,
    isApprovedERC20Token$
  }
}
