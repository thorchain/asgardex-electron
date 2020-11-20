import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import { GetExplorerTxUrl } from '../clients/types'
import { selectedAsset$ } from './common'
import { INITIAL_LOAD_TXS_PROPS } from './const'
import { ApiError, TxsPageLD, ErrorId, LoadTxsHandler, ResetTxsPageHandler, LoadTxsProps } from './types'

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

/**
 * State of `LoadTxsProps`, which triggers reload of txs history
 */
const { get$: loadTxsProps$, set: setLoadTxsProps } = observableState<LoadTxsProps>(INITIAL_LOAD_TXS_PROPS)

export { setLoadTxsProps }

export const loadTxs: LoadTxsHandler = setLoadTxsProps

export const resetTxsPage: ResetTxsPageHandler = () => setLoadTxsProps(INITIAL_LOAD_TXS_PROPS)

/**
 * Factory create a stream of `TxsPageRD` based on selected asset
 */
export const txs$: TxsPageLD = Rx.combineLatest([selectedAsset$, loadTxsProps$]).pipe(
  RxOp.switchMap(([oAsset, loadTxsProps]) =>
    FP.pipe(
      oAsset,
      O.fold(
        () => Rx.of(RD.initial),
        (asset) => {
          switch (asset.chain) {
            case 'BNB':
              return BNB.txs$(asset, loadTxsProps)
            case 'BTC':
              return BTC.txs$(loadTxsProps)
            case 'ETH':
              return Rx.of(RD.failure({ errorId: ErrorId.GET_ASSET_TXS, msg: 'Not implemented yet' } as ApiError))
            case 'THOR':
              return Rx.of(RD.failure({ errorId: ErrorId.GET_ASSET_TXS, msg: 'Not implemented yet' } as ApiError))
            default:
              return Rx.of(
                RD.failure({ errorId: ErrorId.GET_ASSET_TXS, msg: `Unsupported chain ${asset.chain}` } as ApiError)
              )
          }
        }
      )
    )
  )
)
