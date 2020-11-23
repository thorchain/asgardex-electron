import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import * as C from '../clients'
import { ExplorerUrl$, GetExplorerTxUrl$ } from '../clients/types'
import { client$, selectedAsset$ } from './common'
import { INITIAL_LOAD_TXS_PROPS } from './const'
import { ApiError, TxsPageLD, ErrorId, LoadTxsHandler, ResetTxsPageHandler, LoadTxsProps } from './types'

export const explorerUrl$: ExplorerUrl$ = C.explorerUrl$(client$)

export const getExplorerTxUrl$: GetExplorerTxUrl$ = C.getExplorerTxUrl$(client$)

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
