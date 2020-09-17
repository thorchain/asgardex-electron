import { AssetSymbol, assetToBase, assetAmount, Asset } from '@thorchain/asgardex-util'

import {
  PricePoolCurrencySymbols,
  PricePoolCurrencyWeights,
  PoolAsset,
  PricePool,
  PricePoolAssets
} from './views/pools/types'

export const AssetBTC: Asset = { chain: 'BTC', symbol: 'BTC', ticker: 'BTC' }
export const AssetETH: Asset = { chain: 'ETH', symbol: 'ETH', ticker: 'ETH' }

// Currency symbols used for pricing
export const CURRENCY_SYMBOLS: PricePoolCurrencySymbols = {
  [PoolAsset.RUNEB1A]: AssetSymbol.RUNE,
  [PoolAsset.RUNE67C]: AssetSymbol.RUNE,
  [PoolAsset.BTC]: AssetSymbol.BTC,
  [PoolAsset.ETH]: AssetSymbol.ETH,
  [PoolAsset.BUSDBAF]: AssetSymbol.USD,
  [PoolAsset.BUSDBD1]: AssetSymbol.USD
}

// Weight of currencies needed for pricing
// The higher the value the higher the weight
export const CURRENCY_WHEIGHTS: PricePoolCurrencyWeights = {
  [PoolAsset.BUSDBAF]: 0,
  [PoolAsset.BUSDBD1]: 1,
  [PoolAsset.ETH]: 2,
  [PoolAsset.BTC]: 3,
  [PoolAsset.RUNEB1A]: 4,
  [PoolAsset.RUNE67C]: 5
}

// One `AssetAmount` in `BaseAmount` as const, since we just need it at different places
export const ONE_ASSET_BASE_AMOUNT = assetToBase(assetAmount(1))

// We will never have a "RUNE" pool, but we do need such thing for pricing
export const RUNE_PRICE_POOL: PricePool = {
  asset: PoolAsset.RUNE67C,
  poolData: { assetBalance: ONE_ASSET_BASE_AMOUNT, runeBalance: ONE_ASSET_BASE_AMOUNT }
}

export const getRunePricePool = (runeSymbol?: PoolAsset) =>
  ({
    asset: runeSymbol || PoolAsset.RUNE67C,
    poolData: { assetBalance: ONE_ASSET_BASE_AMOUNT, runeBalance: ONE_ASSET_BASE_AMOUNT }
  } as PricePool)

// Whitelist of pools for pricing things
export const PRICE_POOLS_WHITELIST: PricePoolAssets = [
  PoolAsset.BTC,
  PoolAsset.ETH,
  PoolAsset.BUSDBAF,
  PoolAsset.BUSDBD1
]
