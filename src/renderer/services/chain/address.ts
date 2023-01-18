import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import {
  AvalancheChain,
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
import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import * as BCH from '../bitcoincash'
import { address$, WalletAddress$ } from '../clients'
import * as COSMOS from '../cosmos'
import * as DOGE from '../doge'
import * as ETH from '../ethereum'
import * as LTC from '../litecoin'
import * as THOR from '../thorchain'
import { client$ } from './client'

/**
 * Returns keystore addresses by givven chain
 */
const addressByChain$ = (chain: Chain): WalletAddress$ => {
  switch (chain) {
    case BNBChain:
      return BNB.address$
    case BTCChain:
      return BTC.address$
    case ETHChain:
      return ETH.address$
    case THORChain:
      return THOR.address$
    case AvalancheChain:
      // not supported yet
      return Rx.of(O.none)
    case CosmosChain:
      return COSMOS.address$
    case BCHChain:
      return BCH.address$
    case LTCChain:
      return LTC.address$
    case DOGEChain:
      return DOGE.address$
  }
}

/**
 * Users wallet address for selected pool asset
 */
const assetAddress$ = (chain: Chain): WalletAddress$ => address$(client$, chain)

export { assetAddress$, addressByChain$ }
