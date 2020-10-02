import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import * as BNB from '../binance/service'
import { ApiError, ErrorId } from './types'

const explorerTxUrlByChain$ = (chain: Chain): Rx.Observable<O.Option<string>> => {
  switch (chain) {
    case 'BNB':
      return BNB.explorerUrl$.pipe(RxOp.map(FP.flow(O.map((url) => `${url}/tx/`))))
    case 'BTC':
      // not implemented yet
      return Rx.of(O.none)
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

const reloadAssetTxsByChain = (chain: Chain) => {
  switch (chain) {
    case 'BNB':
      return BNB.reloadTxsSelectedAsset
    case 'BTC':
      // not implemented yet
      return () => {}
    case 'ETH':
      // not implemented yet
      return () => {}
    case 'THOR':
      // reload THOR balances - not available yet
      return () => {}
    default:
      return () => {}
  }
}

const assetTxsByChain$ = (chain: Chain) => {
  switch (chain) {
    case 'BNB':
      return BNB.txsSelectedAsset$
    case 'BTC':
      return Rx.of(RD.failure({ errorId: ErrorId.GET_ASSET_TXS, msg: 'Not implemented yet' } as ApiError))
    case 'ETH':
      return Rx.of(RD.failure({ errorId: ErrorId.GET_ASSET_TXS, msg: 'Not implemented yet' } as ApiError))
    case 'THOR':
      return Rx.of(RD.failure({ errorId: ErrorId.GET_ASSET_TXS, msg: 'Not implemented yet' } as ApiError))
    default:
    // nothing to do
  }
}

export { reloadAssetTxsByChain, assetTxsByChain$, explorerTxUrlByChain$ }
