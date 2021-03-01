import { isChain, Chain } from '@xchainjs/xchain-util'

import { Network } from '../../shared/api/types'
import { envOrDefault } from '../helpers/envHelper'

export const DEFAULT_NETWORK: Network = 'testnet'
export const AVAILABLE_NETWORKS: Network[] = ['testnet', 'chaosnet', 'mainnet']
export const ENABLED_CHAINS: Chain[] = envOrDefault(process.env.REACT_APP_CHAINS_ENABLED, 'THOR,BNB,BTC,LTC')
  .replace(/\s/g, '')
  .split(',')
  .filter(isChain)

// Pagination: max. number of items
export const MAX_ITEMS_PER_PAGE = 10

export const MIDGARD_MAX_RETRY = 3
