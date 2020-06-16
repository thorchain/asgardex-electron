import { getAssetFromString } from '@thorchain/asgardex-util'

import { CurrencySymbols, CurrencyWeights, PoolPriceAssets, PoolAsset } from './views/pools/types'

// Rune ticker as const - just because we use it almost everywhere ...
export const RUNE_TICKER = getAssetFromString(PoolAsset.RUNE)?.ticker ?? 'RUNE'

// Currency symbols used for pricing
export const CURRENCY_SYMBOLS: CurrencySymbols = {
  [PoolAsset.RUNE]: 'ᚱ',
  [PoolAsset.BTC]: '₿',
  [PoolAsset.ETH]: 'Ξ',
  [PoolAsset.TUSDB]: '$'
}

// Weight of currencies to use for pricing in application
// The hihgher the value the higher the weight
export const CURRENCY_WHEIGHTS: CurrencyWeights = {
  [PoolAsset.TUSDB]: 0,
  [PoolAsset.ETH]: 1,
  [PoolAsset.BTC]: 2,
  [PoolAsset.RUNE]: 3
}

// Whitelist of pools for pricing things
export const PRICE_POOLS_WHITELIST: PoolPriceAssets = [PoolAsset.BTC, PoolAsset.ETH, PoolAsset.TUSDB]
