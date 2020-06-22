import * as path from 'path'

import { getAssetFromString, assetToBase, assetAmount } from '@thorchain/asgardex-util'
import { remote } from 'electron'

import {
  PricePoolCurrencySymbols,
  PricePoolCurrencyWeights,
  PricePoolAssets,
  PoolAsset,
  PricePool
} from './views/pools/types'

// Rune ticker as const - just because we use it almost everywhere ...
export const RUNE_TICKER = getAssetFromString(PoolAsset.RUNE)?.ticker ?? 'RUNE'

// Currency symbols used for pricing
export const CURRENCY_SYMBOLS: PricePoolCurrencySymbols = {
  [PoolAsset.RUNE]: 'ᚱ',
  [PoolAsset.BTC]: '₿',
  [PoolAsset.ETH]: 'Ξ',
  [PoolAsset.TUSDB]: '$'
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

export const APP_NAME = remote?.app?.name ?? 'ASGARDEX'

// Whitelist of pools for pricing things
export const PRICE_POOLS_WHITELIST: PricePoolAssets = [PoolAsset.BTC, PoolAsset.ETH, PoolAsset.TUSDB]

export const APP_DATA_DIR = path.join(
  remote?.app?.getPath('appData') ?? './testdata', // we can't access remote.app in tests
  APP_NAME
)
export const STORAGE_DIR = path.join(APP_DATA_DIR, 'storage')
