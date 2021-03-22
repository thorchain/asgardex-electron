import { Address } from '@xchainjs/xchain-client'
import { ETHAddress, getTokenAddress } from '@xchainjs/xchain-ethereum'
import {
  Asset,
  AssetBCH,
  AssetBNB,
  AssetBTC,
  AssetETH,
  assetFromString,
  AssetLTC,
  AssetRune67C,
  AssetRuneB1A,
  AssetRuneNative,
  baseAmount,
  BaseAmount,
  bn
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../shared/api/types'
import { AssetBUSDBAF, AssetBUSDBD1, PRICE_ASSETS } from '../const'
import { PricePoolAsset } from '../views/pools/Pools.types'
import { getEthChecksumAddress } from './addressHelper'
import { getChainAsset, isEthChain } from './chainHelper'
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

// TODO (@asgdx-devs) Use constant `BCH_DECIMAL` from `xchain-util` if available
// see https://github.com/xchainjs/xchainjs-lib/issues/208
export const BCH_DECIMAL = 8

// TODO (@asgdx-devs) Use constant `LTC_DECIMAL` from `xchain-util` if available
// see https://github.com/xchainjs/xchainjs-lib/issues/209
export const LTC_DECIMAL = 8

export const getBnbRuneAsset = (network: Network = 'testnet'): Asset => {
  return network === 'testnet' ? AssetRune67C : AssetRuneB1A
}

export const isRuneBnbAsset = (asset: Asset): boolean =>
  eqAsset.equals(asset, AssetRune67C) || eqAsset.equals(asset, AssetRuneB1A)

/**
 * Check whether an asset is a LTC asset
 */
export const isLtcAsset = (asset: Asset): boolean => eqAsset.equals(asset, AssetLTC)

/**
 * Check whether an asset is a BCH asset
 */
export const isBchAsset = (asset: Asset): boolean => eqAsset.equals(asset, AssetBCH)

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
 * Get ethereum token address (as check sum address) from a given asset
 */
export const getEthTokenAddress: (asset: Asset) => O.Option<Address> = FP.flow(
  getTokenAddress,
  O.fromNullable,
  O.chain(getEthChecksumAddress)
)

/**
 * Get address (as check sum address) from an ETH or ETH token asset
 */
export const getEthAssetAddress = (asset: Asset): O.Option<Address> =>
  isEthAsset(asset) ? O.some(ETHAddress) : getEthTokenAddress(asset)

/**
 * Check whether an asset is an ERC20 asset
 */
export const isEthTokenAsset: (asset: Asset) => boolean = FP.flow(getEthTokenAddress, O.isSome)

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
 * Update ETH token (ERC20) addresses to be based on checksum addresses
 * Other assets then ETH tokens (ERC20) won't be updated and will be returned w/o any changes
 */
export const updateEthChecksumAddress = (asset: Asset): Asset =>
  FP.pipe(
    asset,
    // ETH chain only
    O.fromPredicate(({ chain }) => isEthChain(chain)),
    // ETH asset only
    O.chain(O.fromPredicate(FP.not(isEthAsset))),
    // Get token address as checksum address
    O.chain(FP.flow(getTokenAddress, O.fromNullable)),
    // Update asset for using a checksum address
    O.map((address) => ({ ...asset, symbol: `${asset.ticker}-${address}` })),
    // Return same asset in case of no updates
    O.getOrElse(() => asset)
  )

/**
 * Helper to get Midgard assets properly
 */
export const midgardAssetFromString: (assetString: string) => O.Option<Asset> = FP.flow(
  assetFromString,
  O.fromNullable,
  // FOR ETH tokens we need to update its addresses to have a valid check sum address
  // Because ERC20 assets from Midgard might start with 0X rather than 0x
  // And 0X isn't recognized as valid address in ethers lib
  O.map(updateEthChecksumAddress)
)

/**
 * Helper to convert decimal of asset amounts
 *
 * It can be used to convert Midgard/THORChain amounts,
 * which are always based on 1e8 decimal into any 1e(n) decimal
 *
 * Examples:
 * ETH.ETH: 1e8 -> 1e18
 * ETH.USDT: 1e8 -> 1e6
 *
 * @param amount BaseAmount to convert
 * @param decimal Target decimal
 */
export const convertBaseAmountDecimal = (amount: BaseAmount, decimal: number): BaseAmount => {
  const decimalDiff = decimal - amount.decimal

  const amountBN =
    decimalDiff < 0
      ? amount
          .amount()
          .dividedBy(bn(10 ** (decimalDiff * -1)))
          // Never use `BigNumber`s with decimal within `BaseAmount`
          // that's why we need to set `decimalPlaces` to `0`
          // round down is needed to make sure amount of currency is still available
          // without that, `dividedBy` might round up and provide an currency amount which does not exist
          .decimalPlaces(0, BigNumber.ROUND_DOWN)
      : amount.amount().multipliedBy(bn(10 ** decimalDiff))
  return baseAmount(amountBN, decimal)
}

/**
 * Helper to convert a `BaseAmount`
 * into a `BaseAmount` with max. decimal of `1e8`.
 *
 * If decimal of `BaseAmount` is less than `1e8`, it will be unchanged.
 *
 * Examples:
 *
 * 1e12 -> 1e8
 * upTo1e8BaseAmount(baseAmount(123456789012, 12)) // baseAmount(12345678, 8)
 *
 * 1e6 -> 1e6
 * upTo1e8BaseAmount(baseAmount(123456, 6)) // baseAmount(123456, 6)
 */
export const max1e8BaseAmount = (amount: BaseAmount): BaseAmount =>
  amount.decimal <= THORCHAIN_DECIMAL ? amount : convertBaseAmountDecimal(amount, THORCHAIN_DECIMAL)

/**
 * Helper to convert a `BaseAmount`
 * into `1e8` decimal based `BaseAmount`
 */
export const to1e8BaseAmount = (amount: BaseAmount): BaseAmount => convertBaseAmountDecimal(amount, THORCHAIN_DECIMAL)
