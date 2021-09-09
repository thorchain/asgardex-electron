import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import { DepositParam } from '@xchainjs/xchain-thorchain'
import { THORChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { IPCLedgerSendTxParams, ipcLedgerSendTxParamsIO } from '../../../shared/api/io'
import { LedgerErrorId, Network } from '../../../shared/api/types'
import { retryRequest } from '../../helpers/rx/retryRequest'
import { Network$ } from '../app/types'
import * as C from '../clients'
import { TxHashLD, ErrorId } from '../wallet/types'
import { Client$, SendTxParams } from './types'
import { TransactionService } from './types'

export const createTransactionService = (client$: Client$, network$: Network$): TransactionService => {
  const common = C.createTransactionService(client$)
  /**
   * Sends a deposit request by given `DepositParam`
   */
  const sendPoolTx = (params: DepositParam): TxHashLD =>
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

  const sendLedgerTx = ({ network, params }: { network: Network; params: SendTxParams }) => {
    const sendLedgerTxParams: IPCLedgerSendTxParams = {
      chain: THORChain,
      network,
      asset: params.asset,
      amount: params.amount,
      recipient: params.recipient,
      memo: params.memo
    }
    const encoded = ipcLedgerSendTxParamsIO.encode(sendLedgerTxParams)

    return FP.pipe(
      Rx.from(window.apiHDWallet.sendLedgerTx(encoded)),
      RxOp.switchMap(
        FP.flow(
          E.fold<LedgerErrorId, TxHash, TxHashLD>(
            (error) =>
              Rx.of(
                RD.failure({
                  errorId: ErrorId.SEND_TX,
                  msg: `Sending Ledger tx failed. (error id: ${error})`
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
        if (params.walletType === 'ledger') return sendLedgerTx({ network, params })

        return common.sendTx(params)
      })
    )

  return {
    ...common,
    sendTx,
    sendPoolTx$: sendPoolTx
  }
}
