import { PoolData } from '@thorchain/asgardex-util'
import {
  assetToBase,
  assetAmount,
  bn,
  AssetBTC,
  AssetETH,
  Asset,
  assetToString,
  baseAmount,
  AssetRuneNative
} from '@xchainjs/xchain-util'

import { PricePoolCurrencyWeights, PricePoolAssets } from './views/pools/Pools.types'

// BUSD testnet (neded for pricing)
export const AssetBUSDBAF: Asset = { chain: 'BNB', symbol: 'BUSD-BAF', ticker: 'BUSD' }
// BUSD mainnet (neded for pricing)
export const AssetBUSDBD1: Asset = { chain: 'BNB', symbol: 'BUSD-BD1', ticker: 'BUSD' }

export const PRICE_ASSETS: PricePoolAssets = [AssetRuneNative, AssetETH, AssetBTC, AssetBUSDBAF, AssetBUSDBD1]

// Weight of currencies needed for pricing
// The higher the value the higher the weight
export const CURRENCY_WHEIGHTS: PricePoolCurrencyWeights = {
  [assetToString(AssetBUSDBAF)]: 0,
  [assetToString(AssetBUSDBD1)]: 1,
  [assetToString(AssetETH)]: 2,
  [assetToString(AssetBTC)]: 3,
  [assetToString(AssetRuneNative)]: 4
}

// One `AssetAmount` in `BaseAmount` as const, since we just need it at different places
export const ONE_ASSET_BASE_AMOUNT = assetToBase(assetAmount(1))

// One `AssetAmount` as const, since we just need it at different places
export const ONE_ASSET_AMOUNT = assetAmount(1)

// Whitelist of pools for pricing things
export const PRICE_POOLS_WHITELIST: PricePoolAssets = [AssetBTC, AssetETH, AssetBUSDBAF, AssetBUSDBD1]

export const ZERO_BN = bn(0)

export const ONE_BN = bn(1)

export const ZERO_ASSET_AMOUNT = assetAmount(ZERO_BN)

export const ZERO_BASE_AMOUNT = baseAmount(ZERO_BN)

export const ZERO_POOL_DATA: PoolData = { runeBalance: ZERO_BASE_AMOUNT, assetBalance: ZERO_BASE_AMOUNT }
