import {
  Asset,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetRune67C,
  AssetRuneB1A,
  AssetRuneNative,
  Chain
} from '@xchainjs/xchain-util'

import { Network } from '../../shared/api/types'
import { AssetBUSDBAF, AssetBUSDBD1, PRICE_ASSETS } from '../const'
import { DEFAULT_NETWORK } from '../services/const'
import { PricePoolAsset } from '../views/pools/Pools.types'
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
export const ETH_DECIMAL = 18

/**
 * Returns RUNE asset depending on network and chain
 *
 * @deprecated Use `AssetRuneNative`
 */
export const getRuneAsset = ({ network = 'testnet', chain = 'BNB' }: { network?: Network; chain: Chain }): Asset => {
  // For future implementation only - we don't support Native Rune yet...
  if (chain === 'THOR') return AssetRuneNative
  // in other cases RUNE is running on Binance chain
  return network === 'testnet' ? AssetRune67C : AssetRuneB1A
}

/**
 * Returns RUNE asset depending on DEFAULT_NETWORK
 *
 * @deprecated Use `AssetRuneNative`
 */
export const getDefaultRuneAsset = (chain: Chain = 'BNB') => getRuneAsset({ network: DEFAULT_NETWORK, chain })
/**
 * Check whether an asset is a RUNE asset
 */
export const isRuneAsset = (asset: Asset): boolean =>
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
