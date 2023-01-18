import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import {
  BCHChain,
  BNBChain,
  BTCChain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  THORChain
} from '../../../shared/utils/chain'
import { observableState } from '../../helpers/stateHelper'
import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import * as BCH from '../bitcoincash'
import * as C from '../clients'
import { ExplorerUrl$, TxsPageLD, LoadTxsParams } from '../clients'
import * as COSMOS from '../cosmos'
import * as DOGE from '../doge'
import * as ETH from '../ethereum'
import * as LTC from '../litecoin'
import * as THOR from '../thorchain'
import { client$, selectedAsset$ } from './common'
import { INITIAL_LOAD_TXS_PROPS } from './const'
import { ApiError, ErrorId, LoadTxsHandler, ResetTxsPageHandler } from './types'

export const explorerUrl$: ExplorerUrl$ = C.explorerUrl$(client$)

/**
 * State of `LoadTxsProps`, which triggers reload of txs history
 */
const { get$: loadTxsProps$, set: setLoadTxsProps } = observableState<LoadTxsParams>(INITIAL_LOAD_TXS_PROPS)

export { setLoadTxsProps }

export const loadTxs: LoadTxsHandler = setLoadTxsProps

export const resetTxsPage: ResetTxsPageHandler = () => setLoadTxsProps(INITIAL_LOAD_TXS_PROPS)

/**
 * Factory create a stream of `TxsPageRD` based on selected asset
 */
export const getTxs$: (walletAddress: O.Option<string>, walletIndex: number) => TxsPageLD = (
  walletAddress = O.none,
  walletIndex
) =>
  Rx.combineLatest([selectedAsset$, loadTxsProps$]).pipe(
    RxOp.switchMap(([oAsset, { limit, offset }]) =>
      FP.pipe(
        oAsset,
        O.fold(
          () => Rx.of(RD.initial),
          ({ asset }) => {
            switch (asset.chain) {
              case BNBChain:
                return BNB.txs$({ asset: O.some(asset), limit, offset, walletAddress, walletIndex })
              case BTCChain:
                return BTC.txs$({ asset: O.none, limit, offset, walletAddress, walletIndex })
              case ETHChain:
                return ETH.txs$({ asset: O.some(asset), limit, offset, walletAddress, walletIndex })
              case THORChain:
                return THOR.txs$({ asset: O.none, limit, offset, walletAddress, walletIndex })
              case LTCChain:
                return LTC.txs$({ asset: O.none, limit, offset, walletAddress, walletIndex })
              case BCHChain:
                return BCH.txs$({ asset: O.none, limit, offset, walletAddress, walletIndex })
              case DOGEChain:
                return DOGE.txs$({ asset: O.none, limit, offset, walletAddress, walletIndex })
              case CosmosChain:
                return COSMOS.txs$({ asset: O.some(asset), limit, offset, walletAddress, walletIndex })
              default:
                return Rx.of(
                  RD.failure<ApiError>({ errorId: ErrorId.GET_ASSET_TXS, msg: `Unsupported chain ${asset.chain}` })
                )
            }
          }
        )
      )
    )
  )
