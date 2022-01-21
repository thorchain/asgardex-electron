import { BTC_DECIMAL } from '@xchainjs/xchain-bitcoin'
import { BCH_DECIMAL } from '@xchainjs/xchain-bitcoincash'
import { DECIMAL as COSMOS_DECIMAL } from '@xchainjs/xchain-cosmos'
import { DOGE_DECIMAL } from '@xchainjs/xchain-doge'
import { ETH_DECIMAL } from '@xchainjs/xchain-ethereum'
import { LTC_DECIMAL } from '@xchainjs/xchain-litecoin'
import { DECIMAL as THOR_DECIMAL } from '@xchainjs/xchain-thorchain'
import {
  BaseAmount,
  baseAmount,
  BCHChain,
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  PolkadotChain,
  THORChain
} from '@xchainjs/xchain-util'

import { Network } from '../../../../shared/api/types'
import { BNB_DECIMAL } from '../../../helpers/assetHelper'

/**
 * Helper to get minimal amount to send depending on chain
 */
export const smallestAmountToSent = (chain: Chain, _network: Network): BaseAmount => {
  switch (chain) {
    case BNBChain:
      return baseAmount(1, BNB_DECIMAL)
    case BTCChain:
      // 1000 satoshi
      return baseAmount(1000, BTC_DECIMAL)
    case THORChain:
      // 0 thor
      return baseAmount(0, THOR_DECIMAL)
    case ETHChain:
      // zero for ETH
      return baseAmount(0, ETH_DECIMAL)
    case CosmosChain:
      return baseAmount(1, COSMOS_DECIMAL)
    case PolkadotChain:
      // return baseAmount(1, getDecimalDot(getClientNetwork(network))
      throw Error('Polkadot is not supported yet')
    case DOGEChain:
      // 1000 satoshi
      return baseAmount(1000, DOGE_DECIMAL)
    case BCHChain:
      // 1000 satoshi
      return baseAmount(1000, BCH_DECIMAL)
    case LTCChain:
      // 1000 satoshi
      return baseAmount(1000, LTC_DECIMAL)
  }
}
