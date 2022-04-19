import * as RD from '@devexperts/remote-data-ts'
import { AssetLUNA, Client } from '@xchainjs/xchain-terra'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import * as C from '../clients'
import { ErrorId, TxHashLD } from '../wallet/types'
import { Client$, SendPoolTxParams, SendTxParams } from './types'
import { TransactionService } from './types'

export const createTransactionService = (client$: Client$): TransactionService => {
  const common = C.createTransactionService(client$)

  const sendTx = (params: SendTxParams): TxHashLD => {
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

  // As same as `sendTx`, but by adding `feeAsset: AssetLUNA` to `transfer` only
  // Because all pool tx fees for Terra will be paid in `LUNA`
  // See: Bifrost does "consider transactions with fee paid in uluna" only
  // ^ https://gitlab.com/thorchain/thornode/-/blob/develop/bifrost/pkg/chainclients/terra/cosmos_block_scanner.go#L195
  const sendPoolTx$ = (params: SendPoolTxParams): TxHashLD => {
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

  return {
    ...common,
    /* common.sendTx is overridden here  */
    sendTx,
    sendPoolTx$
  }
}
