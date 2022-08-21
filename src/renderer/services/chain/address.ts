import {
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  ETHChain,
  PolkadotChain,
  THORChain,
  BCHChain,
  LTCChain,
  DOGEChain,
  TerraChain
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { observableState } from '../../helpers/stateHelper'
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
import { INITIAL_SYM_DEPOSIT_ADDRESSES } from './const'
import { SymDepositAddresses } from './types'

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
    case PolkadotChain:
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
    case TerraChain:
      // Terra (Classic) is not supported in ASGDX anymore anymore
      return Rx.of(O.none)
  }
}

/**
 * Users wallet address for selected pool asset
 */
const assetAddress$ = (chain: Chain): WalletAddress$ => address$(client$, chain)

/**
 * State of addresses used for sym. deposits
 * It will be set at view level (`DepositView` or `SymDepositView`)
 */
const { get$: symDepositAddresses$, set: setSymDepositAddresses } =
  observableState<SymDepositAddresses>(INITIAL_SYM_DEPOSIT_ADDRESSES)

export { assetAddress$, addressByChain$, symDepositAddresses$, setSymDepositAddresses }
