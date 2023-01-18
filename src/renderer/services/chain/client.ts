import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import {
  BCHChain,
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  THORChain
} from '../../../shared/utils/chain'
import * as BNC from '../binance'
import * as BTC from '../bitcoin'
import * as BCH from '../bitcoincash'
import { XChainClient$ } from '../clients'
import * as COSMOS from '../cosmos'
import * as DOGE from '../doge'
import * as ETH from '../ethereum'
import * as LTC from '../litecoin'
import { selectedPoolChain$ } from '../midgard/common'
import * as THOR from '../thorchain'
import type { Chain$ } from './types'

export const clientByChain$ = (chain: Chain): XChainClient$ => {
  switch (chain) {
    case BNBChain:
      return BNC.client$
    case BTCChain:
      return BTC.client$
    case BCHChain:
      return BCH.client$
    case ETHChain:
      return ETH.client$
    case THORChain:
      return THOR.client$
    case LTCChain:
      return LTC.client$
    case DOGEChain:
      return DOGE.client$
    case CosmosChain:
      return COSMOS.client$
    default:
      return Rx.of(O.none)
  }
}

export const getClientByChain$: (chain$: Chain$) => XChainClient$ = (chain$) =>
  chain$.pipe(
    RxOp.switchMap(
      O.fold(
        () => Rx.EMPTY,
        (chain) => clientByChain$(chain)
      )
    )
  )

/**
 * Client depending on selected pool chain
 */
export const client$ = getClientByChain$(selectedPoolChain$)
