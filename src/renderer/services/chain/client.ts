import { Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import * as BNC from '../binance'
import * as BTC from '../bitcoin'
import { XChainClient$ } from '../clients'
import { selectedPoolChain$ } from '../midgard/common'
import * as THOR from '../thorchain'
import { Chain$ } from './types'

export const clientByChain$ = (chain: Chain): XChainClient$ => {
  switch (chain) {
    case 'BNB':
      return BNC.client$
    case 'BTC':
      return BTC.client$
    case 'ETH':
      return Rx.of(O.none)
    case 'THOR':
      return THOR.client$
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
