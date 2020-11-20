import * as RD from '@devexperts/remote-data-ts'
import { WS, Client, Address } from '@xchainjs/xchain-binance'
import { Asset, AssetAmount, assetToBase } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'
import { map, catchError, startWith, switchMap } from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { ApiError, ErrorId, TxsPageLD, LoadTxsProps, TxRD, TxLD } from '../wallet/types'
import { TransactionService, Client$, TxWithStateLD } from './types'

/**
 * Observable to load txs from Binance API endpoint
 */
const loadTxs$ = ({
  client,
  oAsset,
  limit,
  offset
}: {
  client: Client
  oAsset: O.Option<Asset>
  limit: number
  offset: number
}): TxsPageLD => {
  const txAsset = FP.pipe(
    oAsset,
    O.fold(
      () => undefined,
      (asset) => asset.symbol
    )
  )

  return Rx.from(
    client.getTransactions({
      asset: txAsset,
      address: client.getAddress(),
      limit,
      offset
    })
  ).pipe(
    map(RD.success),
    catchError((error) =>
      Rx.of(RD.failure({ errorId: ErrorId.GET_ASSET_TXS, msg: error?.message ?? error.toString() } as ApiError))
    ),
    startWith(RD.pending)
  )
}

/**
 * `Txs` of selected asset
 *
 * Data will be loaded by first subscription only
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
const txs$ = (client$: Client$) => (asset: Asset, { limit, offset }: LoadTxsProps): TxsPageLD =>
  client$.pipe(
    switchMap((oClient) =>
      FP.pipe(
        oClient,
        O.fold(
          () => Rx.of(RD.initial),
          (client) =>
            loadTxs$({
              client,
              oAsset: O.some(asset),
              limit,
              offset
            })
        )
      )
    )
  )

const { get$: txRD$, set: setTxRD } = observableState<TxRD>(RD.initial)

export type SendTxParams = {
  to: Address
  amount: AssetAmount
  asset: Asset
  memo?: string
}

const tx$ = ({ client$, to, amount, asset, memo }: { client$: Client$ } & SendTxParams): TxLD =>
  client$.pipe(
    switchMap((oClient) => (O.isSome(oClient) ? Rx.of(oClient.value) : Rx.EMPTY)),
    switchMap((client) =>
      Rx.from(
        client.transfer({
          asset,
          amount: assetToBase(amount),
          recipient: to,
          memo
        })
      )
    ),
    map(RD.success),
    startWith(RD.pending)
  )

const pushTx = (client$: Client$) => ({ to, amount, asset, memo }: SendTxParams): Rx.Subscription =>
  tx$({ client$, to, amount, asset, memo }).subscribe(setTxRD)

const sendStakeTx = (client$: Client$) => ({ to, amount, asset, memo }: SendTxParams): TxLD =>
  tx$({ client$, to, amount, asset, memo })

const txWithState$ = (wsTransfer$: Rx.Observable<O.Option<WS.Transfer>>): TxWithStateLD =>
  FP.pipe(
    Rx.combineLatest([txRD$, wsTransfer$]),
    RxOp.map(([tx, state]) =>
      FP.pipe(
        tx,
        RD.map((txHash) => ({ txHash, state }))
      )
    )
  )

export const createTransactionService = (
  client$: Client$,
  wsTransfer$: Rx.Observable<O.Option<WS.Transfer>>
): TransactionService => {
  return {
    txRD$,
    pushTx: pushTx(client$),
    sendStakeTx: sendStakeTx(client$),
    txs$: txs$(client$),
    txWithState$: txWithState$(wsTransfer$),
    resetTx: () => setTxRD(RD.initial)
  }
}
