import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import { DepositParam, Client } from '@xchainjs/xchain-thorchain'
import { THORChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { LedgerErrorId, LedgerTHORTxParams, Network } from '../../../shared/api/types'
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
      // RxOp.switchMap((oClient) => (O.isSome(oClient) ? Rx.of(oClient.value) : Rx.EMPTY)),
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

  const sendLedgerTx = ({ client, network, params }: { client: Client; network: Network; params: SendTxParams }) => {
    const nodeUrl = client.getClientUrl()
    const txParams: LedgerTHORTxParams = {
      sender: '',
      nodeUrl,
      amount: params.amount,
      recipient: params.recipient
    }
    return FP.pipe(
      Rx.from(window.apiHDWallet.sendLedgerTx({ chain: THORChain, network, txParams })),
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
      )
    )
  }

  const sendTx = (params: SendTxParams) =>
    FP.pipe(
      Rx.combineLatest([client$, network$]),
      RxOp.switchMap(([oClient, network]) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.EMPTY,
            (client) => Rx.of({ client, network })
          )
        )
      ),
      RxOp.switchMap(({ client, network }) => {
        if (params.walletType === 'ledger') return sendLedgerTx({ client, network, params })

        return common.sendTx(params)
      })
    )

  return {
    ...common,
    sendTx,
    sendPoolTx$: sendPoolTx
  }
}
