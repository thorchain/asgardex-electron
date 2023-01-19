import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import { Client, GAIAChain } from '@xchainjs/xchain-cosmos'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { IPCLedgerSendTxParams, ipcLedgerSendTxParamsIO } from '../../../shared/api/io'
import { LedgerError, Network } from '../../../shared/api/types'
import { isLedgerWallet } from '../../../shared/utils/guard'
import { Network$ } from '../app/types'
import * as C from '../clients'
import { ErrorId, TxHashLD } from '../wallet/types'
import { Client$, SendTxParams } from './types'
import { TransactionService } from './types'

export const createTransactionService = (client$: Client$, network$: Network$): TransactionService => {
  const common = C.createTransactionService(client$)

  const sendKeystoreTx = (params: SendTxParams): TxHashLD => {
    const { asset, recipient, amount, feeAmount, memo, walletIndex } = params
    return FP.pipe(
      client$,
      RxOp.switchMap(FP.flow(O.fold<Client, Rx.Observable<Client>>(() => Rx.EMPTY, Rx.of))),
      RxOp.switchMap((client) => Rx.from(client.transfer({ walletIndex, asset, amount, recipient, memo, feeAmount }))),
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

  const sendLedgerTx = ({ network, params }: { network: Network; params: SendTxParams }): TxHashLD => {
    const { asset, sender, amount, recipient, memo, walletIndex, feeAmount } = params

    const sendLedgerTxParams: IPCLedgerSendTxParams = {
      chain: GAIAChain,
      network,
      asset,
      feeAsset: undefined,
      amount,
      sender,
      recipient,
      memo,
      walletIndex,
      feeRate: NaN,
      feeOption: undefined,
      feeAmount,
      nodeUrl: undefined,
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
                  msg: `Sending Ledger COSMOS tx failed. (${msg})`
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
      network$,
      RxOp.switchMap((network) => {
        if (isLedgerWallet(params.walletType)) return sendLedgerTx({ network, params })

        return sendKeystoreTx(params)
      })
    )

  return {
    ...common,
    sendTx
  }
}
