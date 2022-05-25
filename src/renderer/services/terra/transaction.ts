import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import { AssetLUNA, Client } from '@xchainjs/xchain-terra'
import { TerraChain } from '@xchainjs/xchain-util'
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
import { Client$, SendPoolTxParams, SendTxParams } from './types'
import { TransactionService } from './types'

export const createTransactionService = (client$: Client$, network$: Network$): TransactionService => {
  const common = C.createTransactionService(client$)

  const sendLedgerTx = ({
    network,
    params
  }: {
    network: Network
    params: Omit<SendTxParams, 'feeAmount' | 'gasLimit'>
  }): TxHashLD => {
    const { asset, feeAsset, amount, recipient, memo, walletIndex } = params
    const sendLedgerTxParams: IPCLedgerSendTxParams = {
      chain: TerraChain,
      network,
      asset,
      feeAsset,
      amount,
      sender: undefined,
      recipient,
      memo,
      walletIndex,
      feeRate: NaN,
      feeOption: undefined
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
                  msg: `Sending Ledger ${sendLedgerTxParams.asset?.symbol ?? AssetLUNA.symbol} tx failed. (${msg})`
                })
              ),
            (txHash) => Rx.of(RD.success(txHash))
          )
        )
      ),
      RxOp.startWith(RD.pending)
    )
  }

  const _sendTx = (params: SendTxParams): TxHashLD => {
    const { asset, recipient, amount, feeAsset, feeAmount, gasLimit, memo, walletIndex } = params
    return FP.pipe(
      client$,
      RxOp.switchMap(FP.flow(O.fold<Client, Rx.Observable<Client>>(() => Rx.EMPTY, Rx.of))),
      RxOp.switchMap((client) =>
        Rx.from(client.transfer({ walletIndex, asset, amount, recipient, memo, feeAsset, feeAmount, gasLimit }))
      ),
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

  const sendTx = (params: SendTxParams): TxHashLD =>
    FP.pipe(
      network$,
      RxOp.switchMap((network) => {
        if (isLedgerWallet(params.walletType)) return sendLedgerTx({ network, params })

        return _sendTx(params)
      })
    )

  // As same as `sendTx`, but it adds `feeAsset: AssetLUNA` to `transfer`
  // Because all pool tx fees for Terra will be paid in `LUNA`
  // See: Bifrost does "consider transactions with fee paid in uluna" only
  // ^ https://gitlab.com/thorchain/thornode/-/blob/develop/bifrost/pkg/chainclients/terra/cosmos_block_scanner.go#L195
  const _sendPoolTx$ = (params: SendPoolTxParams): TxHashLD => {
    const { asset, recipient, amount, memo, walletIndex } = params

    return FP.pipe(
      client$,
      RxOp.switchMap(FP.flow(O.fold<Client, Rx.Observable<Client>>(() => Rx.EMPTY, Rx.of))),
      RxOp.switchMap((client) =>
        Rx.from(client.transfer({ walletIndex, asset, amount, recipient, memo, feeAsset: AssetLUNA }))
      ),
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

  const sendPoolTx$ = (params: SendPoolTxParams): TxHashLD =>
    FP.pipe(
      network$,
      RxOp.switchMap((network) => {
        if (isLedgerWallet(params.walletType))
          return sendLedgerTx({ network, params: { ...params, feeAsset: AssetLUNA } })

        return _sendPoolTx$(params)
      })
    )

  return {
    ...common,
    sendTx,
    sendPoolTx$
  }
}
