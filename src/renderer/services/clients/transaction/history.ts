import * as RD from '@devexperts/remote-data-ts'
import { XChainClient } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import { map, catchError, startWith, switchMap } from 'rxjs/operators'

import { ApiError, ErrorId } from '../../wallet/types'
import { XChainClient$, TxsPageLD, TxsParams } from '../types'

/**
 * Observable to load txs from Binance API endpoint
 */
const loadTxs$ = ({
  client,
  asset,
  limit,
  offset,
  walletAddress
}: {
  client: XChainClient
} & TxsParams): TxsPageLD => {
  const txAsset = FP.pipe(
    asset,
    O.map(({ symbol }) => symbol),
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
      Rx.of(RD.failure({ errorId: ErrorId.GET_ASSET_TXS, msg: error?.message ?? error.toString() } as ApiError))
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
