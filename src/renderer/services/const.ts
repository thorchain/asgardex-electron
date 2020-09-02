import { PricePoolAssets, PoolAsset } from '../views/pools/types'
import { Network } from './app/types'

// Whitelist of pools for pricing things
export const PRICE_POOLS_WHITELIST: PricePoolAssets = [PoolAsset.BTC, PoolAsset.ETH, PoolAsset.TUSDB]

export const DEFAULT_NETWORK: Network = 'testnet'
export const AVAILABLE_NETWORKS: Network[] = ['testnet', 'chaosnet', 'mainnet']

// Pagination: max. number of pages
export const MAX_PAGES = 10
