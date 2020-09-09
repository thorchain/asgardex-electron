import { bn } from '@thorchain/asgardex-util'

import { BUSDAsset, PoolAsset, RUNEAsset } from '../views/pools/types'
import { Network } from './app/types'

export const DEFAULT_NETWORK: Network = 'testnet'
export const AVAILABLE_NETWORKS: Network[] = ['testnet', 'chaosnet', 'mainnet']

type CommonAssets = 'BNB' | 'ETH' | 'BTC'

const commonAssets: Record<CommonAssets, PoolAsset> = {
  BNB: PoolAsset.BNB,
  ETH: PoolAsset.ETH,
  BTC: PoolAsset.BTC
}

type Pools = Record<CommonAssets, PoolAsset> & { RUNE: RUNEAsset } & { BUSD: BUSDAsset }

const networkPools: Record<Network, Pools> = {
  testnet: {
    ...commonAssets,
    RUNE: PoolAsset.RUNE67C,
    BUSD: PoolAsset.BUSDBAF
  },
  mainnet: {
    ...commonAssets,
    RUNE: PoolAsset.RUNEB1A,
    BUSD: PoolAsset.BUSDBD1
  },
  chaosnet: {
    ...commonAssets,
    RUNE: PoolAsset.RUNEB1A,
    BUSD: PoolAsset.BUSDBD1
  }
}

export const mapNetworkToPoolAssets = (network: Network) => networkPools[network]

// Pagination: max. number of items
export const MAX_PAGINATION_ITEMS = 10

export const MIDGARD_MAX_RETRY = 3

export const ZERO_BN = bn(0)
