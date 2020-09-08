import { Balance, Balances } from '@thorchain/asgardex-binance'
import {
  getValueOfAsset1InAsset2,
  PoolData,
  BaseAmount,
  assetAmount,
  bnOrZero,
  assetFromString,
  AssetTicker,
  getValueOfRuneInAsset,
  Asset,
  assetToBase,
  bn,
  isValidBN
} from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { PoolDetails } from '../midgard/types'
import { getPoolDetail, toPoolData } from '../midgard/utils'
import { AssetWithBalance, AssetsWithBalance } from '../wallet/types'

/**
 * Helper to get a pool price value for a given `Balance`
 */
export const getPoolPriceValue = (
  { asset, amount }: AssetWithBalance,
  poolDetails: PoolDetails,
  selectedPricePoolData: PoolData
): O.Option<BaseAmount> => {
  return FP.pipe(
    getPoolDetail(poolDetails, asset.ticker),
    O.map(toPoolData),
    // calculate value based on `pricePoolData`
    O.map((poolData) => getValueOfAsset1InAsset2(amount, poolData, selectedPricePoolData)),
    O.alt(() => {
      // Calculate RUNE values based on `pricePoolData`
      if (asset.ticker === AssetTicker.RUNE) {
        return O.some(getValueOfRuneInAsset(amount, selectedPricePoolData))
      }
      // In all other cases we don't have any price pool and no price
      return O.none
    })
  )
}

/**
 * Converts a BinanceChain symbol to an `Asset`
 **/
export const bncSymbolToAsset = (symbol: string): O.Option<Asset> =>
  O.fromNullable(assetFromString(bncSymbolToAssetString(symbol)))

/**
 * Converts a BinanceChain symbol to an `Asset` string
 **/
export const bncSymbolToAssetString = (symbol: string) => `BNB.${symbol}`

export const getWalletBalances = (balances: Balances): AssetsWithBalance =>
  balances.reduce((acc, { symbol, free, frozen }: Balance) => {
    const oAsset = bncSymbolToAsset(symbol)
    // ignore balances w/o symbols
    return FP.pipe(
      oAsset,
      O.map((asset) => {
        const amountBN = bnOrZero(free)
        const amount = assetToBase(assetAmount(amountBN))
        const frozenAmountBN = bn(frozen)
        const frozenAmount = isValidBN(frozenAmountBN) ? O.some(assetToBase(assetAmount(frozenAmountBN))) : O.none

        return [...acc, { asset, amount, frozenAmount }]
      }),
      O.getOrElse(() => acc)
    )
  }, [] as AssetsWithBalance)
