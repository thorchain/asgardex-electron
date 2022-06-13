import * as Client from '@xchainjs/xchain-client'
import { isChain, Chain } from '@xchainjs/xchain-util'

import { Network } from '../../shared/api/types'
import { envOrDefault } from '../../shared/utils/env'
import { SlipTolerance } from '../types/asgardex'

export const DEFAULT_NETWORK: Network =
  process.env.NODE_ENV !== 'production' && process.env.REACT_APP_DEFAULT_NETWORK === 'testnet' ? 'testnet' : 'mainnet'
export const DEFAULT_SLIP_TOLERANCE: SlipTolerance = 3
export const DEFAULT_CLIENT_NETWORK: Client.Network = Client.Network.Mainnet

export const AVAILABLE_NETWORKS: Network[] = ['testnet', 'stagenet', 'mainnet']

export const ENABLED_CHAINS: Chain[] = envOrDefault(
  process.env.REACT_APP_CHAINS_ENABLED,
  'THOR,BNB,BTC,LTC,BCH,ETH,DOGE,TERRA,GAIA'
)
  .replace(/\s/g, '')
  .split(',')
  .filter(isChain)

// Pagination: max. number of items
export const MAX_ITEMS_PER_PAGE = 10

export const MIDGARD_MAX_RETRY = 3
