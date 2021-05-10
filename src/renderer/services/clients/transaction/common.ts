import * as RD from '@devexperts/remote-data-ts'
import { Address, TxHash, XChainClient } from '@xchainjs/xchain-client'
import { getTokenAddress } from '@xchainjs/xchain-ethereum'
import { ETHChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ApiError, ErrorId, TxLD } from '../../wallet/types'
import { TxsPageLD, TxsParams } from '../types'

/**
 * Observable to load txs
 */
export const loadTxs$ = ({
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
    RxOp.map(RD.success),
    RxOp.catchError((error) =>
      Rx.of(RD.failure<ApiError>({ errorId: ErrorId.GET_ASSET_TXS, msg: error?.message ?? error.toString() }))
    ),
    RxOp.startWith(RD.pending)
  )
}

/**
 * Observable to load data of a `Tx`
 */
export const loadTx$ = ({
  client,
  txHash,
  assetAddress
}: {
  client: XChainClient
  txHash: TxHash
  assetAddress: O.Option<Address>
}): TxLD =>
  Rx.from(client.getTransactionData(txHash, O.toUndefined(assetAddress))).pipe(
    RxOp.map(RD.success),
    RxOp.catchError((error) =>
      Rx.of(RD.failure<ApiError>({ errorId: ErrorId.GET_TX, msg: error?.message ?? error.toString() }))
    ),
    RxOp.startWith(RD.pending)
  )
