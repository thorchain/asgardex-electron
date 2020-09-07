import { PoolAsset } from '../views/pools/types'
import { Network } from './app/types'

export const DEFAULT_NETWORK: Network = 'testnet'
export const AVAILABLE_NETWORKS: Network[] = ['testnet', 'chaosnet', 'mainnet']

const commonAssets = {
  BNB: 'BNB.BNB',
  ETH: 'ETH.ETH',
  BTC: 'BTC.BTC',
  BUSDB: 'BNB.BUSDB-000'
}

const networkPools = {
  testnet: {
    ...commonAssets,
    RUNE: PoolAsset.RUNE67C
  },
  mainnet: {
    ...commonAssets,
    RUNE: PoolAsset.RUNEB1A
  },
  chaosnet: {
    ...commonAssets,
    RUNE: PoolAsset.RUNEB1A
  }
}

export const mapNetworkToPoolAssets = (network: Network) => networkPools[network]

// Pagination: max. number of items
export const MAX_PAGINATION_ITEMS = 10

export const MIDGARD_MAX_RETRY = 3
