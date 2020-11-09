import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import * as BNB from '../binance/service'
import { loadAssetTxs as loadBtcTxs, assetTxs$ as btcTxs$ } from '../bitcoin/context'
import { selectedAsset$ } from './common'
import { ApiError, AssetTxsPageLD, ErrorId, LoadAssetTxsHandler } from './types'

const loadAssetTxsHandlerByChain = (chain: Chain): O.Option<LoadAssetTxsHandler> => {
  switch (chain) {
    case 'BNB':
      return O.some(() => BNB.loadAssetTxs)
    case 'BTC':
      return O.some(() => loadBtcTxs)
    case 'ETH':
      // not implemented yet
      return O.none
    case 'THOR':
      // reload THOR balances - not available yet
      return O.none
    default:
      return O.none
  }
}

export const loadAssetTxsHandler$: Rx.Observable<O.Option<LoadAssetTxsHandler>> = selectedAsset$.pipe(
  RxOp.switchMap(
    O.fold(
      () => Rx.EMPTY,
      ({ chain }) => Rx.of(loadAssetTxsHandlerByChain(chain))
    )
  )
)

export const assetTxsByChain$ = (chain: Chain): AssetTxsPageLD => {
  switch (chain) {
    case 'BNB':
      return BNB.assetTxs$
    case 'BTC':
      return btcTxs$
    case 'ETH':
      return Rx.of(RD.failure({ errorId: ErrorId.GET_ASSET_TXS, msg: 'Not implemented yet' } as ApiError))
    case 'THOR':
      return Rx.of(RD.failure({ errorId: ErrorId.GET_ASSET_TXS, msg: 'Not implemented yet' } as ApiError))
    default:
      return Rx.of(RD.failure({ errorId: ErrorId.GET_ASSET_TXS, msg: `Unsupported chain ${chain}` } as ApiError))
  }
}

export const assetTxs$: AssetTxsPageLD = selectedAsset$.pipe(
  RxOp.switchMap(
    O.fold(
      () => Rx.EMPTY,
      ({ chain }) => assetTxsByChain$(chain)
    )
  )
)
