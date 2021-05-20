import { PoolData } from '@thorchain/asgardex-util'
import {
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

//
// ERC 20 assets
//

export const AssetUSDTERC20: Asset = {
  chain: 'ETH',
  symbol: 'USDT-0xa3910454bf2cb59b8b3a401589a3bacc5ca42306',
  ticker: 'USDT'
}

export const AssetRuneEthERC20: Asset = {
  chain: 'ETH',
  symbol: 'RUNE-0xd601c6A3a36721320573885A8d8420746dA3d7A0',
  ticker: 'RUNE'
}

// ETH.THOR - for testnet only
export const AssetThorERC20: Asset = {
  chain: 'ETH',
  symbol: 'THOR-0xA0b515c058F127a15Dd3326F490eBF47d215588e',
  ticker: 'THOR'
}

export const AssetTKN8ERC20: Asset = {
  chain: 'ETH',
  symbol: 'TKN8-0x242aD49dAcd38aC23caF2ccc118482714206beD4',
  ticker: 'TKN8'
}

export const AssetTKN18ERC20: Asset = {
  chain: 'ETH',
  symbol: 'TKN18-0x8E3f9E9b5B26AAaE9d31364d2a8e8a9dd2BE3B82',
  ticker: 'TKN18'
}

export const AssetWETHERC20: Asset = {
  chain: 'ETH',
  symbol: 'WETH-0xbCA556c912754Bc8E7D4Aad20Ad69a1B1444F42d',
  ticker: 'WETH'
}

export const AssetDAIERC20: Asset = {
  chain: 'ETH',
  symbol: 'DAI-0xad6d458402f60fd3bd25163575031acdce07538d',
  ticker: 'DAI'
}

// This hardcode list is for testnet only
export const ERC20Assets = [
  AssetUSDTERC20,
  AssetRuneEthERC20,
  AssetThorERC20,
  AssetTKN8ERC20,
  AssetTKN18ERC20,
  AssetWETHERC20,
  AssetDAIERC20
]
export const ETHAssets = [AssetETH, ...ERC20Assets]

//
// All of following assets are needed for pricing USD
//

// BUSD testnet
export const AssetBUSDBAF: Asset = { chain: 'BNB', symbol: 'BUSD-BAF', ticker: 'BUSD' }
export const AssetBUSD74E: Asset = { chain: 'BNB', symbol: 'BUSD-74E', ticker: 'BUSD' }
// BUSD mainnet
export const AssetBUSDBD1: Asset = { chain: 'BNB', symbol: 'BUSD-BD1', ticker: 'BUSD' }
// BNB.USDT
export const AssetUSDTDC8: Asset = { chain: 'BNB', symbol: 'USDT-DC8', ticker: 'USDT' }
// ETH.USDT mainnet
export const AssetUSDTDAC: Asset = {
  chain: 'ETH',
  symbol: 'USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7',
  ticker: 'USDT'
}
// ETH.USDT testnet
export const AssetUSDT62E: Asset = {
  chain: 'ETH',
  symbol: 'USDT-0x62e273709Da575835C7f6aEf4A31140Ca5b1D190',
  ticker: 'USDT'
}
// ETH.USDC mainnet
export const AssetUSDC: Asset = {
  chain: 'ETH',
  symbol: 'USDC-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  ticker: 'USDC'
}

export const DEFAULT_PRICE_ASSETS: PricePoolAssets = [AssetRuneNative, AssetETH, AssetBTC]

export const USD_PRICE_ASSETS: PricePoolAssets = [
  AssetBUSDBAF,
  AssetBUSDBD1,
  AssetBUSD74E,
  AssetUSDTDC8,
  AssetUSDTDAC,
  AssetUSDT62E,
  AssetUSDTERC20,
  AssetUSDC
]

// Weight of currencies needed for pricing
// The higher the value the higher the weight
export const CURRENCY_WHEIGHTS: PricePoolCurrencyWeights = {
  [assetToString(AssetBUSDBAF)]: 0,
  [assetToString(AssetBUSDBD1)]: 1,
  [assetToString(AssetBUSD74E)]: 2,
  [assetToString(AssetUSDTDC8)]: 3,
  [assetToString(AssetUSDTDAC)]: 4,
  [assetToString(AssetUSDT62E)]: 5,
  [assetToString(AssetUSDTERC20)]: 6,
  [assetToString(AssetUSDC)]: 7,
  [assetToString(AssetETH)]: 8,
  [assetToString(AssetBTC)]: 9,
  [assetToString(AssetRuneNative)]: 10
}

// Whitelist of pools for pricing things
export const PRICE_POOLS_WHITELIST: PricePoolAssets = [...DEFAULT_PRICE_ASSETS, ...USD_PRICE_ASSETS]

export const ZERO_BN = bn(0)

export const ONE_BN = bn(1)

export const ZERO_ASSET_AMOUNT = assetAmount(ZERO_BN)

export const ZERO_BASE_AMOUNT = baseAmount(ZERO_BN)

export const ZERO_POOL_DATA: PoolData = { runeBalance: ZERO_BASE_AMOUNT, assetBalance: ZERO_BASE_AMOUNT }
