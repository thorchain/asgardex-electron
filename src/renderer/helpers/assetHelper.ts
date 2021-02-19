import { getTokenAddress } from '@xchainjs/xchain-ethereum'
import { Asset, AssetBNB, AssetBTC, AssetETH, AssetRune67C, AssetRuneB1A, AssetRuneNative } from '@xchainjs/xchain-util'
import * as ethers from 'ethers'

import { Network } from '../../shared/api/types'
import { AssetBUSDBAF, AssetBUSDBD1, PRICE_ASSETS } from '../const'
import { PricePoolAsset } from '../views/pools/Pools.types'
import { getChainAsset } from './chainHelper'
import { eqAsset } from './fp/eq'

/**
 * Decimal for any asset handled by THORChain and provided by Midgard
 *
 * Note 1: THORChain will only ever treat assets to be `1e8`
 * Note 2: `THORCHAIN_DECIMAL` has to be used for pools/swap/liquidity only,
 * at wallet parts we will get information about decimal from agardex client libs
 * (eg. `asgardex-binance|bitcoin|ethereum` and others)
 *
 * */
export const THORCHAIN_DECIMAL = 8

/**
 * Number of decimals for Binance chain assets
 * Example:
 * 1 RUNE == 100,000,000 ð (tor)
 * 0.00000001 RUNE == 1 ð (tor)
 * */
export const BNB_DECIMAL = 8

/**
 * 1 BTC == 100,000,000 satoshi
 * 0.00000001 BTC == 1 satoshi
 * */
export const BTC_DECIMAL = 8

/**
 * 1 ether == 1,000,000,000,000,000,000 wei (1e18)
 * 0.000000000000000001 ether == 1 wei
 * */
// TODO (@asgdx-devs) Use constant `ETH_DECIMAL` from `xchain-util` if available
// see https://github.com/xchainjs/xchainjs-lib/issues/210
export const ETH_DECIMAL = 18

// TODO (@asgdx-devs) Use constant `LTC_DECIMAL` from `xchain-util` if available
// see https://github.com/xchainjs/xchainjs-lib/issues/208
export const BTH_DECIMAL = 8

// TODO (@asgdx-devs) Use constant `LTC_DECIMAL` from `xchain-util` if available
// see https://github.com/xchainjs/xchainjs-lib/issues/209
export const LTC_DECIMAL = 8

export const getBnbRuneAsset = (network: Network = 'testnet'): Asset => {
  return network === 'testnet' ? AssetRune67C : AssetRuneB1A
}

export const isRuneBnbAsset = (asset: Asset): boolean =>
  eqAsset.equals(asset, AssetRune67C) || eqAsset.equals(asset, AssetRuneB1A)

/**
 * Check whether an asset is a BNB asset
 */
export const isBnbAsset = (asset: Asset): boolean => eqAsset.equals(asset, AssetBNB)

/**
 * Check whether an asset is a BTC asset
 */
export const isBtcAsset = (asset: Asset): boolean => eqAsset.equals(asset, AssetBTC)

/**
 * Check whether an asset is an ETH asset
 */
export const isEthAsset = (asset: Asset): boolean => eqAsset.equals(asset, AssetETH)

/**
 * Check whether an asset is an RuneNative asset
 */
export const isRuneNativeAsset = (asset: Asset): boolean => eqAsset.equals(asset, AssetRuneNative)

/**
 * Check whether an asset is a BUSD asset
 */
export const isBUSDAsset = (asset: Asset): boolean =>
  eqAsset.equals(asset, AssetBUSDBAF) || eqAsset.equals(asset, AssetBUSDBD1)

// Type guard for `PricePoolAsset`
export const isPricePoolAsset = (asset: Asset): asset is PricePoolAsset =>
  // all of PoolAsset except BNB -> see `PricePoolAsset`
  PRICE_ASSETS.includes(asset)

export const isChainAsset = (asset: Asset): boolean => eqAsset.equals(asset, getChainAsset(asset.chain))

/**
 * Get ethereum token address from a given asset
 */
export const getEthTokenAddress = (asset: Asset): string => {
  const tokenAddress = getTokenAddress(asset)
  return tokenAddress ? ethers.utils.getAddress(tokenAddress) : ''
}
