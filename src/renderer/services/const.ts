import { PricePoolAssets, PoolAsset } from '../views/pools/types'
import { Network } from './app/types'

// Whitelist of pools for pricing things
export const PRICE_POOLS_WHITELIST: PricePoolAssets = [PoolAsset.BTC, PoolAsset.ETH, PoolAsset.TUSDB]

export const DEFAULT_NETWORK: Network = 'testnet'
export const AVAILABLE_NETWORKS: Network[] = ['testnet', 'chaosnet', 'mainnet']

type Network2 = typeof AVAILABLE_NETWORKS[0]

export const availableNetwork3 = ['testnet', 'chaosnet', 'mainnet']
export type Network3 = typeof availableNetwork3[0]
