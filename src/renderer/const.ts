import { AssetSymbol, assetToBase, assetAmount } from '@thorchain/asgardex-util'

import {
  PricePoolCurrencySymbols,
  PricePoolCurrencyWeights,
  PoolAsset,
  PricePool,
  PricePoolAssets
} from './views/pools/types'

// Currency symbols used for pricing
export const CURRENCY_SYMBOLS: PricePoolCurrencySymbols = {
  [PoolAsset.RUNE]: AssetSymbol.RUNE,
  [PoolAsset.BTC]: AssetSymbol.BTC,
  [PoolAsset.ETH]: AssetSymbol.ETH,
  [PoolAsset.TUSDB]: AssetSymbol.USD
}

// Weight of currencies needed for pricing
// The higher the value the higher the weight
export const CURRENCY_WHEIGHTS: PricePoolCurrencyWeights = {
  [PoolAsset.TUSDB]: 0,
  [PoolAsset.ETH]: 1,
  [PoolAsset.BTC]: 2,
  [PoolAsset.RUNE]: 3
}

// One `AssetAmount` in `BaseAmount` as const, since we just need it at different places
export const ONE_ASSET_BASE_AMOUNT = assetToBase(assetAmount(1))

// We will never have a "RUNE" pool, but we do need such thing for pricing
export const RUNE_PRICE_POOL: PricePool = {
  asset: PoolAsset.RUNE,
  poolData: { assetBalance: ONE_ASSET_BASE_AMOUNT, runeBalance: ONE_ASSET_BASE_AMOUNT }
}

// Whitelist of pools for pricing things
export const PRICE_POOLS_WHITELIST: PricePoolAssets = [PoolAsset.BTC, PoolAsset.ETH, PoolAsset.TUSDB]
