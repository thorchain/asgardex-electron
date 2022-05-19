import { Address } from '@xchainjs/xchain-client'
import { ETHAddress, getTokenAddress } from '@xchainjs/xchain-ethereum'
import { AssetLUNA } from '@xchainjs/xchain-terra'
import {
  Asset,
  assetAmount,
  AssetAmount,
  AssetBCH,
  AssetBNB,
  AssetBTC,
  AssetDOGE,
  AssetETH,
  assetFromString,
  AssetLTC,
  AssetRune67C,
  AssetRuneB1A,
  AssetRuneERC20,
  AssetRuneERC20Testnet,
  AssetRuneNative,
  baseAmount,
  BaseAmount,
  bn
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as P from 'fp-ts/lib/Predicate'
import * as S from 'fp-ts/lib/string'

import { Network } from '../../shared/api/types'
import {
  AssetTGTERC20,
  AssetUST,
  AssetXRune,
  AssetXRuneTestnet,
  BinanceBlackList,
  DEFAULT_PRICE_ASSETS,
  USD_PRICE_ASSETS
} from '../const'
import { ERC20_WHITELIST } from '../types/generated/thorchain/erc20whitelist'
import { PricePoolAsset } from '../views/pools/Pools.types'
import { getEthChecksumAddress } from './addressHelper'
import { getChainAsset, isBchChain, isBnbChain, isBtcChain, isDogeChain, isEthChain, isLtcChain } from './chainHelper'
import { eqAsset, eqString } from './fp/eq'
import { sequenceTOption } from './fpHelpers'

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

export const getBnbRuneAsset = (network: Network = 'testnet'): Asset => {
  return network === 'testnet' ? AssetRune67C : AssetRuneB1A
}

export const isRuneBnbAsset = (asset: Asset, network: Network): boolean =>
  network === 'mainnet' ? eqAsset.equals(asset, AssetRuneB1A) : eqAsset.equals(asset, AssetRune67C)

export const isRuneEthAsset = (asset: Asset, network: Network): boolean =>
  network === 'mainnet' ? eqAsset.equals(asset, AssetRuneERC20) : eqAsset.equals(asset, AssetRuneERC20Testnet)

export const isNonNativeRuneAsset = (asset: Asset, network: Network): boolean =>
  isRuneBnbAsset(asset, network) || isRuneEthAsset(asset, network)

/**
 * Check whether an asset is an RuneNative asset
 */
export const isRuneNativeAsset = (asset: Asset): boolean => eqAsset.equals(asset, AssetRuneNative)

/**
 * Check whether an asset is a Rune (native or non-native) asset
 */
export const isRuneAsset = (asset: Asset, network: Network): boolean =>
  isRuneNativeAsset(asset) || isNonNativeRuneAsset(asset, network)

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
 * Check whether an asset is a BNB synthetic asset
 */
export const isBnbAssetSynth = (asset: Asset): boolean => eqAsset.equals(asset, { ...AssetBNB, synth: true })

/**
 * Check whether an asset is a BTC asset
 */
export const isBtcAsset = (asset: Asset): boolean => eqAsset.equals(asset, AssetBTC)

/**
 * Check whether an asset is an ETH asset
 */
export const isEthAsset = (asset: Asset): boolean => eqAsset.equals(asset, AssetETH)

/**
 * Check whether an asset is a DOGE asset
 */
export const isDogeAsset = (asset: Asset): boolean => eqAsset.equals(asset, AssetDOGE)

/**
 * Check whether an asset is a LUNA asset
 */
export const isLunaAsset = (asset: Asset): boolean => eqAsset.equals(asset, AssetLUNA)

/**
 * Check whether an asset is a UST (Terra) asset
 */
export const isUstAsset = (asset: Asset): boolean => eqAsset.equals(asset, AssetUST)

/**
 * Check whether an ERC20 asset is white listed or not
 */
export const assetInERC20Whitelist = (asset: Asset): boolean =>
  FP.pipe(
    ERC20_WHITELIST,
    A.findFirst(({ asset: assetInList }) => eqAsset.equals(assetInList, asset)),
    O.isSome
  )

/**
 * Get's icon url from white list
 */
export const iconUrlInERC20Whitelist = (asset: Asset): O.Option<string> =>
  FP.pipe(
    ERC20_WHITELIST,
    A.findFirst(({ asset: assetInList }) => eqAsset.equals(assetInList, asset)),
    O.chain(({ iconUrl }) => iconUrl)
  )

/**
 * Checks whether ETH/ERC20 asset is whitelisted or not
 * based on following rules:
 * (1) Check on `mainnet` only
 * (2) Always accept ETH
 * (3) ERC20 asset needs to be listed in `ERC20Whitelist`
 */
export const validAssetForETH = (asset: Asset /* ETH or ERC20 asset */, network: Network): boolean =>
  network !== 'mainnet' /* (1) */ || isEthAsset(asset) /* (2) */ || assetInERC20Whitelist(asset)

/**
 * Check whether an ERC20 address is black listed or not
 */
const addressInList = (address: Address, list: Asset[]): boolean => {
  const oChecksumAddress = getEthChecksumAddress(address)
  return FP.pipe(
    list,
    A.findFirst(
      FP.flow(
        getEthTokenAddress,
        (oAddressInList) => sequenceTOption(oAddressInList, oChecksumAddress),
        O.map(([itemAddress, checksumAddress]) => eqString.equals(itemAddress, checksumAddress)),
        O.getOrElse<boolean>(() => false)
      )
    ),
    O.isSome
  )
}

const erc20WhiteListAssetOnly = FP.pipe(
  ERC20_WHITELIST,
  A.map(({ asset }) => asset)
)
/**
 * Check whether an ERC20 address is white listed or not
 */
export const addressInERC20Whitelist = (address: Address): boolean => addressInList(address, erc20WhiteListAssetOnly)

/**
 * Check whether an asset is black listed for Binance or not
 */
export const assetInBinanceBlacklist = (network: Network, asset: Asset): boolean =>
  FP.pipe(
    BinanceBlackList[network],
    A.findFirst((assetInList) => eqAsset.equals(assetInList, asset)),
    O.isSome
  )

/**
 * Check whether an asset is XRune asset
 */
export const isXRuneAsset = (asset: Asset): boolean =>
  eqAsset.equals(asset, AssetXRune) || eqAsset.equals(asset, AssetXRuneTestnet)

/**
 * Check whether an asset is TGT asset
 */
export const isTgtERC20Asset = (asset: Asset): boolean => eqAsset.equals(asset, AssetTGTERC20)

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

// Type guard for `PricePoolAsset`
export const isPricePoolAsset = (asset: Asset): asset is PricePoolAsset =>
  // all of PoolAsset except BNB -> see `PricePoolAsset`
  [...DEFAULT_PRICE_ASSETS, ...USD_PRICE_ASSETS].includes(asset)

export const isChainAsset = (asset: Asset): boolean => eqAsset.equals(asset, getChainAsset(asset.chain))

export const isUSDAsset = ({ ticker }: Asset): boolean => ticker.includes('USD') || ticker.includes('UST')

export const isUtxoAssetChain = ({ chain }: Asset) =>
  isBtcChain(chain) || isBchChain(chain) || isLtcChain(chain) || isDogeChain(chain)

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
    O.chain(O.fromPredicate(P.not(isEthAsset))),
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

/**
 * Helper to convert a `AssetAmount`
 * into two sigfig `AssetAmount`
 */
export const getTwoSigfigAssetAmount = (amount: AssetAmount) => {
  const amountIntegerValue = amount.amount().integerValue(BigNumber.ROUND_DOWN)
  const precisionCount = amountIntegerValue.gt(0) ? amountIntegerValue.toString().length + 2 : 2
  return assetAmount(amount.amount().toPrecision(precisionCount))
}

export const disableRuneUpgrade = ({
  asset,
  haltThorChain,
  haltEthChain,
  haltBnbChain,
  network
}: {
  asset: Asset
  haltThorChain: boolean
  haltEthChain: boolean
  haltBnbChain: boolean
  network: Network
}) => {
  if (isNonNativeRuneAsset(asset, network)) {
    // BNB.RUNE + ETH.RUNE
    if (haltThorChain) return true
    // ETH.RUNE
    if (isEthChain(asset.chain) && haltEthChain) return true
    // BNB.RUNE
    if (isBnbChain(asset.chain) && haltBnbChain) return true
  }
  return false
}

/**
 * Creates an asset from `nullable` string
 */
export const getAssetFromNullableString = (assetString?: string): O.Option<Asset> =>
  FP.pipe(O.fromNullable(assetString), O.map(S.toUpperCase), O.map(assetFromString), O.chain(O.fromNullable))
