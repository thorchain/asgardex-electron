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
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import * as BCH from '../bitcoincash'
import { address$, Address$, AddressWithChain$ } from '../clients'
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

const addressWithChain$ = (chain: Chain): AddressWithChain$ =>
  // transform Option<Address> => Option<{chain: Chain, address: Address}>
  FP.pipe(chain, addressByChain$, RxOp.map(FP.flow(O.map((address) => ({ chain, address })))))

/**
 * Users wallet address for selected pool asset
 */
const assetAddress$: Address$ = address$(client$)

export { assetAddress$, addressByChain$, addressWithChain$ }
