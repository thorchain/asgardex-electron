import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import { ClientUrl, DepositParam } from '@xchainjs/xchain-thorchain'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import {
  IPCLedgerDepositTxParams,
  ipcLedgerDepositTxParamsIO,
  IPCLedgerSendTxParams,
  ipcLedgerSendTxParamsIO
} from '../../../shared/api/io'
import { LedgerError, Network } from '../../../shared/api/types'
import { THORChain } from '../../../shared/utils/chain'
import { isLedgerWallet } from '../../../shared/utils/guard'
import { HDMode, WalletType } from '../../../shared/wallet/types'
import { retryRequest } from '../../helpers/rx/retryRequest'
import { Network$ } from '../app/types'
import * as C from '../clients'
import { TxHashLD, ErrorId } from '../wallet/types'
import { Client$, ClientUrl$, SendTxParams } from './types'
import { TransactionService } from './types'

export const createTransactionService = (
  client$: Client$,
  network$: Network$,
  clientUrl$: ClientUrl$
): TransactionService => {
  const common = C.createTransactionService(client$)

  const depositLedgerTx = ({
    network,
    clientUrl,
    params
  }: {
    network: Network
    clientUrl: ClientUrl
    params: DepositParam & {
      walletIndex: number /* override walletIndex of DepositParam to avoid 'undefined' */
      hdMode: HDMode
    }
  }) => {
    const depositLedgerTxParams: IPCLedgerDepositTxParams = {
      chain: THORChain,
      network,
      asset: params.asset,
      amount: params.amount,
      memo: params.memo,
      recipient: undefined,
      router: undefined,
      walletIndex: params.walletIndex,
      feeOption: undefined,
      nodeUrl: clientUrl[network].node,
      hdMode: params.hdMode
    }
    const encoded = ipcLedgerDepositTxParamsIO.encode(depositLedgerTxParams)

    return FP.pipe(
      Rx.from(window.apiHDWallet.depositLedgerTx(encoded)),
      RxOp.switchMap(
        FP.flow(
          E.fold<LedgerError, TxHash, TxHashLD>(
            ({ msg }) =>
              Rx.of(
                RD.failure({
                  errorId: ErrorId.DEPOSIT_LEDGER_TX_ERROR,
                  msg: `Deposit Ledger THOR tx failed. (${msg})`
                })
              ),
            (txHash) => Rx.of(RD.success(txHash))
          )
        )
      ),
      RxOp.startWith(RD.pending)
    )
  }

  /**
   * Sends a deposit request by given `DepositParam`
   */
  const depositTx = (params: DepositParam): TxHashLD =>
    client$.pipe(
      RxOp.switchMap((oClient) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.EMPTY,
            (client) => Rx.of(client)
          )
        )
      ),
      RxOp.switchMap((client) => Rx.from(client.deposit(params))),
      RxOp.map(RD.success),
      RxOp.retryWhen(retryRequest({ maxRetry: 3, scalingDuration: 1000 /* 1 sec. */ })),
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

  const sendPoolTx = ({
    walletType,
    walletIndex,
    hdMode,
    asset,
    amount,
    memo
  }: DepositParam & {
    walletType: WalletType
    hdMode: HDMode
    walletIndex: number /* override walletIndex of DepositParam to avoid 'undefined' */
  }) =>
    FP.pipe(
      Rx.combineLatest([network$, clientUrl$]),
      RxOp.switchMap(([network, clientUrl]) => {
        if (isLedgerWallet(walletType))
          return depositLedgerTx({ network, clientUrl, params: { walletIndex, hdMode, asset, amount, memo } })

        return depositTx({ walletIndex, asset, amount, memo })
      })
    )

  const sendLedgerTx = ({
    network,
    clientUrl,
    params
  }: {
    network: Network
    clientUrl: ClientUrl
    params: SendTxParams
  }): TxHashLD => {
    const sendLedgerTxParams: IPCLedgerSendTxParams = {
      chain: THORChain,
      network,
      asset: params.asset,
      feeAsset: undefined,
      amount: params.amount,
      sender: params.sender,
      recipient: params.recipient,
      memo: params.memo,
      walletIndex: params.walletIndex,
      feeRate: NaN,
      feeOption: undefined,
      feeAmount: undefined,
      nodeUrl: clientUrl[network].node,
      hdMode: 'default'
    }
    const encoded = ipcLedgerSendTxParamsIO.encode(sendLedgerTxParams)

    return FP.pipe(
      Rx.from(window.apiHDWallet.sendLedgerTx(encoded)),
      RxOp.switchMap(
        FP.flow(
          E.fold<LedgerError, TxHash, TxHashLD>(
            ({ msg }) =>
              Rx.of(
                RD.failure({
                  errorId: ErrorId.SEND_LEDGER_TX,
                  msg: `Sending Ledger THOR tx failed. (${msg})`
                })
              ),
            (txHash) => Rx.of(RD.success(txHash))
          )
        )
      ),
      RxOp.startWith(RD.pending)
    )
  }

  const sendTx = (params: SendTxParams) =>
    FP.pipe(
      Rx.combineLatest([network$, clientUrl$]),
      RxOp.switchMap(([network, clientUrl]) => {
        if (isLedgerWallet(params.walletType)) return sendLedgerTx({ network, clientUrl, params })

        return common.sendTx(params)
      })
    )

  return {
    ...common,
    sendTx,
    sendPoolTx$: sendPoolTx
  }
}
