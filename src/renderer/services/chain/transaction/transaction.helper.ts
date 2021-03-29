import { BTC_DECIMAL } from '@xchainjs/xchain-bitcoin'
import { BCH_DECIMAL } from '@xchainjs/xchain-bitcoincash'
import { DECIMAL as COSMOS_DECIMAL } from '@xchainjs/xchain-cosmos'
import { ETH_DECIMAL } from '@xchainjs/xchain-ethereum'
import { LTC_DECIMAL } from '@xchainjs/xchain-litecoin'
import { DECIMAL as THOR_DECIMAL } from '@xchainjs/xchain-thorchain'
import { BaseAmount, baseAmount, Chain } from '@xchainjs/xchain-util'

import { Network } from '../../../../shared/api/types'
import { BNB_DECIMAL } from '../../../helpers/assetHelper'

/**
 * Helper to get minimal amount to send depending on chain
 */
export const smallestAmountToSent = (chain: Chain, _network: Network): BaseAmount => {
  switch (chain) {
    case 'BNB':
      return baseAmount(1, BNB_DECIMAL)
    case 'BTC':
      // 1000 satoshi
      return baseAmount(1000, BTC_DECIMAL)
    case 'THOR':
      // 1 thor
      return baseAmount(1, THOR_DECIMAL)
    case 'ETH':
      // zero for ETH
      return baseAmount(0, ETH_DECIMAL)
    case 'GAIA':
      return baseAmount(1, COSMOS_DECIMAL)
    case 'POLKA':
      // return baseAmount(1, getDecimalDot(network === 'mainnet' ? 'mainnet' : 'testnet'))
      throw Error('Polkadot is not supported yet')
    case 'BCH':
      // 1000 satoshi
      return baseAmount(1000, BCH_DECIMAL)
    case 'LTC':
      // 1000 satoshi
      return baseAmount(1000, LTC_DECIMAL)
  }
}
