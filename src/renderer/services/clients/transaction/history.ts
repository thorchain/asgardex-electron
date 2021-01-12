import * as RD from '@devexperts/remote-data-ts'
import { XChainClient } from '@xchainjs/xchain-client'
import { getTokenAddress } from '@xchainjs/xchain-ethereum'
import { ETHChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import { map, catchError, startWith, switchMap } from 'rxjs/operators'

import { ApiError, ErrorId } from '../../wallet/types'
import { XChainClient$, TxsPageLD, TxsParams } from '../types'

/**
 * Observable to load txs
 */
const loadTxs$ = ({
  client,
  asset: oAsset,
  limit,
  offset,
  walletAddress
}: {
  client: XChainClient
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
    map(RD.success),
    catchError((error) =>
      Rx.of(
        RD.failure<ApiError>({ errorId: ErrorId.GET_ASSET_TXS, msg: error?.message ?? error.toString() })
      )
    ),
    startWith(RD.pending)
  )
}

/**
 * `Txs` state by given client
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
export const txs$: (client$: XChainClient$) => (params: TxsParams) => TxsPageLD = (client$) => ({
  asset,
  limit,
  offset,
  walletAddress
}) =>
  client$.pipe(
    switchMap((oClient) =>
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
