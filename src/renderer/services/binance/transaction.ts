import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import { AssetBNB, BNBChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { IPCLedgerSendTxParams, ipcLedgerSendTxParamsIO } from '../../../shared/api/io'
import { LedgerError, Network } from '../../../shared/api/types'
import { isLedgerWallet } from '../../../shared/utils/guard'
import { Network$ } from '../app/types'
import * as C from '../clients'
import { TxHashLD, ErrorId } from '../wallet/types'
import { Client$, SendTxParams } from './types'
import { TransactionService } from './types'

export const createTransactionService = (client$: Client$, network$: Network$): TransactionService => {
  const common = C.createTransactionService(client$)

  const sendLedgerTx = ({
    network,
    params,
    walletIndex
  }: {
    network: Network
    params: SendTxParams
    walletIndex?: number
  }) => {
    const sendLedgerTxParams: IPCLedgerSendTxParams = {
      chain: BNBChain,
      network,
      asset: params.asset,
      amount: params.amount,
      sender: params.sender,
      recipient: params.recipient,
      memo: params.memo,
      walletIndex: walletIndex ? walletIndex : 0
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
                  msg: `Sending Ledger ${sendLedgerTxParams.asset?.symbol ?? AssetBNB.symbol} tx failed. (${msg})`
                })
              ),
            (txHash) => Rx.of(RD.success(txHash))
          )
        )
      ),
      RxOp.startWith(RD.pending)
    )
  }
  const sendTx = (params: SendTxParams, walletIndex?: number) =>
    FP.pipe(
      network$,
      RxOp.switchMap((network) => {
        if (isLedgerWallet(params.walletType)) return sendLedgerTx({ network, walletIndex, params })

        return common.sendTx(params)
      })
    )

  return {
    ...common,
    sendTx
  }
}
