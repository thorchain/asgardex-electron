import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import * as BNB from '../binance/service'
import * as BTC from '../bitcoin/context'
import { GetExplorerTxUrl } from '../clients/types'
import { selectedAsset$ } from './common'
import { ApiError, AssetTxsPageLD, ErrorId, LoadAssetTxsHandler } from './types'

const explorerUrlByChain$ = (chain: Chain): Rx.Observable<O.Option<string>> => {
  switch (chain) {
    case 'BNB':
      return BNB.explorerUrl$
    case 'BTC':
      return BTC.explorerUrl$
    case 'ETH':
      // not implemented yet
      return Rx.of(O.none)
    case 'THOR':
      // reload THOR balances - not available yet
      return Rx.of(O.none)
    default:
      return Rx.of(O.none)
  }
}

const explorerTxUrlByChain$ = (chain: Chain): Rx.Observable<O.Option<GetExplorerTxUrl>> => {
  switch (chain) {
    case 'BNB':
      return BNB.getExplorerTxUrl$
    case 'BTC':
      return BTC.getExplorerTxUrl$
    case 'ETH':
      // not implemented yet
      return Rx.of(O.none)
    case 'THOR':
      // reload THOR balances - not available yet
      return Rx.of(O.none)
    default:
      return Rx.of(O.none)
  }
}

export const explorerUrl$: Rx.Observable<O.Option<string>> = selectedAsset$.pipe(
  RxOp.switchMap(
    O.fold(
      () => Rx.EMPTY,
      ({ chain }) => explorerUrlByChain$(chain)
    )
  )
)

export const getExplorerTxUrl$: Rx.Observable<O.Option<GetExplorerTxUrl>> = selectedAsset$.pipe(
  RxOp.switchMap(
    O.fold(
      () => Rx.EMPTY,
      ({ chain }) => explorerTxUrlByChain$(chain)
    )
  )
)

const loadAssetTxsHandlerByChain = (chain: Chain): O.Option<LoadAssetTxsHandler> => {
  switch (chain) {
    case 'BNB':
      return O.some(() => BNB.loadAssetTxs)
    case 'BTC':
      return O.some(() => BTC.loadAssetTxs)
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
      return BTC.assetTxs$
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
