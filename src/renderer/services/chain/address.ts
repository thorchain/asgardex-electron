import { BNBChain } from '@xchainjs/xchain-binance'
import { BTCChain } from '@xchainjs/xchain-bitcoin'
import { BCHChain } from '@xchainjs/xchain-bitcoincash'
import { GAIAChain } from '@xchainjs/xchain-cosmos'
import { DOGEChain } from '@xchainjs/xchain-doge'
import { ETHChain } from '@xchainjs/xchain-ethereum'
import { LTCChain } from '@xchainjs/xchain-litecoin'
import { THORChain } from '@xchainjs/xchain-thorchain'
import { Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { isEnabledChain } from '../../../shared/utils/chain'
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
  if (!isEnabledChain(chain)) return Rx.of(O.none)

  switch (chain) {
    case BNBChain:
      return BNB.address$
    case BTCChain:
      return BTC.address$
    case ETHChain:
      return ETH.address$
    case THORChain:
      return THOR.address$
    case GAIAChain:
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
