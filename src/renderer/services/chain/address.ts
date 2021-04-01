import {
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  ETHChain,
  PolkadotChain,
  THORChain,
  BCHChain,
  LTCChain
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import * as BCH from '../bitcoincash'
import { address$, Address$ } from '../clients'
import * as ETH from '../ethereum'
import * as LTC from '../litecoin'
import * as THOR from '../thorchain'
import { client$ } from './client'

// TODO (@veado | @thatStrangeGuyThorchain) Think about returning `Address` of other wallets (Ledger), too
const addressByChain$ = (chain: Chain): Address$ => {
  switch (chain) {
    case BNBChain:
      return BNB.address$
    case BTCChain:
      return BTC.address$
    case ETHChain:
      return ETH.address$
    case THORChain:
      return THOR.address$
    case PolkadotChain:
      // not supported yet
      return Rx.of(O.none)
    case CosmosChain:
      // not supported yet
      return Rx.of(O.none)
    case BCHChain:
      return BCH.address$
    case LTCChain:
      return LTC.address$
  }
}

/**
 * Users wallet address for selected pool asset
 */
const assetAddress$: Address$ = address$(client$)

export { assetAddress$, addressByChain$ }
