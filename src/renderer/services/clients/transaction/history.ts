import * as RD from '@devexperts/remote-data-ts'
import { TxHash, XChainClient } from '@xchainjs/xchain-client'
import { getTokenAddress } from '@xchainjs/xchain-ethereum'
import { ETHChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ApiError, ErrorId, TxLD } from '../../wallet/types'
import { XChainClient$, TxsPageLD, TxsParams } from '../types'

/**
 * Observable to load txs
 */
const loadTxs$ = <T = void>({
  client,
  asset: oAsset,
  limit,
  offset,
  walletAddress
}: {
  client: XChainClient<T>
} & TxsParams): TxsPageLD => {
  const txAsset = FP.pipe(
    oAsset,
    O.map((asset) => (asset.chain === ETHChain ? getTokenAddress(asset) || undefined : asset.symbol)),
    O.toUndefined
  )

  const address = FP.pipe(walletAddress, O.getOrElse(client.getAddress))

  return Rx.from(
    client.getTransactions({
      asset: txAsset,
      address,
      limit,
      offset
    })
  ).pipe(
    RxOp.map(RD.success),
    RxOp.catchError((error) =>
      Rx.of(
        RD.failure<ApiError>({ errorId: ErrorId.GET_ASSET_TXS, msg: error?.message ?? error.toString() })
      )
    ),
    RxOp.startWith(RD.pending)
  )
}

/**
 * `Txs` state by given client
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
export const txsByClient$: <T = void>(client$: XChainClient$<T>) => (params: TxsParams) => TxsPageLD = (client$) => ({
  asset,
  limit,
  offset,
  walletAddress
}) =>
  client$.pipe(
    RxOp.switchMap((oClient) =>
      FP.pipe(
        oClient,
        O.fold(
          () => Rx.of(RD.initial),
          (client) =>
            loadTxs$({
              client,
              asset,
              limit,
              offset,
              walletAddress
            })
        )
      )
    )
  )

/**
 * Observable to load data of a `Tx`
 */
const loadTx$ = <T = void>(client: XChainClient<T>, txHash: TxHash): TxLD =>
  Rx.from(client.getTransactionData(txHash)).pipe(
    RxOp.map(RD.success),
    RxOp.catchError((error) =>
      Rx.of(
        RD.failure<ApiError>({ errorId: ErrorId.GET_TX, msg: error?.message ?? error.toString() })
      )
    ),
    RxOp.startWith(RD.pending)
  )

/**
 * Gets data of a `Tx` by given client
 * If a client is not available, it returns an `initial` state
 */
export const txByClient$: <T = void>(client$: XChainClient$<T>) => (txHash: TxHash) => TxLD = (client$) => (txHash) =>
  client$.pipe(
    RxOp.switchMap((oClient) =>
      FP.pipe(
        oClient,
        O.fold(
          () => Rx.of(RD.initial),
          (client) => loadTx$(client, txHash)
        )
      )
    )
  )
