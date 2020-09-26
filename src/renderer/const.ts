import {
  assetToBase,
  assetAmount,
  bn,
  AssetRuneB1A,
  AssetRune67C,
  AssetBTC,
  AssetETH,
  Asset,
  assetToString
} from '@thorchain/asgardex-util'

import { PricePoolCurrencyWeights, PricePoolAssets, PricePoolAsset } from './views/pools/types'

// BUSD testnet
export const AssetBUSDBAF: Asset = { chain: 'BNB', symbol: 'BUSD-BAF', ticker: 'BUSD' }
// BUSD mainnet
export const AssetBUSDBD1: Asset = { chain: 'BNB', symbol: 'BUSD-BD1', ticker: 'BUSD' }

export const PRICE_ASSETS: PricePoolAssets = [
  AssetRune67C as PricePoolAsset,
  AssetRuneB1A as PricePoolAsset,
  AssetETH as PricePoolAsset,
  AssetBTC as PricePoolAsset,
  AssetBUSDBAF as PricePoolAsset,
  AssetBUSDBD1 as PricePoolAsset
]

export const PRICE_POOL_ASSETS_AS_STRING = PRICE_ASSETS.map((a) => assetToString(a))

// Type guard for `PricePoolAsset`
export const isPricePoolAsset = (asset: Asset): asset is PricePoolAsset =>
  // all of PoolAsset except BNB -> see `PricePoolAsset`
  PRICE_ASSETS.includes(asset)

// Weight of currencies needed for pricing
// The higher the value the higher the weight
export const CURRENCY_WHEIGHTS: PricePoolCurrencyWeights = {
  [assetToString(AssetBUSDBAF)]: 0,
  [assetToString(AssetBUSDBD1)]: 1,
  [assetToString(AssetETH)]: 2,
  [assetToString(AssetBTC)]: 3,
  [assetToString(AssetRune67C)]: 4,
  [assetToString(AssetRuneB1A)]: 5
}

// One `AssetAmount` in `BaseAmount` as const, since we just need it at different places
export const ONE_ASSET_BASE_AMOUNT = assetToBase(assetAmount(1))

// Whitelist of pools for pricing things
export const PRICE_POOLS_WHITELIST: PricePoolAssets = [AssetBTC, AssetETH, AssetBUSDBAF, AssetBUSDBD1]

export const ZERO_BN = bn(0)

export const ONE_BN = bn(1)

export const ZERO_ASSET_AMOUNT = assetAmount(ZERO_BN)
