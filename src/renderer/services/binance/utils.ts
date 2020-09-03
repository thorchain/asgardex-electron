import * as RD from '@devexperts/remote-data-ts'
import { Balance } from '@thorchain/asgardex-binance'
import {
  getValueOfAsset1InAsset2,
  PoolData,
  BaseAmount,
  assetToBase,
  assetAmount,
  bnOrZero,
  assetFromString,
  AssetTicker,
  getValueOfRuneInAsset,
  Asset
} from '@thorchain/asgardex-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import { IntlShape } from 'react-intl'

import { sequenceTOptionFromArray, sequenceTOption } from '../../helpers/fpHelpers'
import { BalancesRD, AssetWithBalance, AssetsWithBalanceRD, AssetsWithBalance } from '../../services/binance/types'
import { PoolDetails } from '../midgard/types'
import { getPoolDetail, toPoolData } from '../midgard/utils'

/**
 * Helper to get a pool price value for a given `Balance`
 */
export const getPoolPriceValue = (
  { free, symbol }: Balance,
  poolDetails: PoolDetails,
  selectedPricePoolData: PoolData
): O.Option<BaseAmount> => {
  const amount = assetToBase(assetAmount(bnOrZero(free)))

  return FP.pipe(
    getPoolDetail(poolDetails, symbol),
    O.map(toPoolData),
    // calculate value based on `pricePoolData`
    O.map((poolData) => getValueOfAsset1InAsset2(amount, poolData, selectedPricePoolData)),
    O.alt(() => {
      const ticker = O.toNullable(bncSymbolToAsset(symbol))?.ticker ?? ''
      // Calculate RUNE values based on `pricePoolData`
      if (ticker === AssetTicker.RUNE) {
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

export const toAssetWithBalances = (balancesRD: BalancesRD, intl?: IntlShape): AssetsWithBalanceRD =>
  FP.pipe(
    balancesRD,
    RD.map(
      A.map((balance) =>
        FP.pipe(
          bncSymbolToAsset(balance.symbol),
          O.map<Asset, AssetWithBalance>((asset) => ({
            asset,
            balance: assetAmount(balance.free),
            frozenBalance: assetAmount(balance.frozen)
          }))
        )
      )
    ),
    RD.map(sequenceTOptionFromArray),
    RD.chain((balances) =>
      RD.fromOption(balances, () =>
        Error(intl?.formatMessage({ id: 'wallet.errors.balancesFailed' }) ?? 'Transform failed')
      )
    )
  )

export const getAssetWithBalance = (assetsWB: AssetsWithBalance, oAsset: O.Option<Asset>): O.Option<AssetWithBalance> =>
  FP.pipe(
    oAsset,
    O.chain((asset) =>
      FP.pipe(
        assetsWB,
        A.findFirst((assetWB) => assetWB.asset.symbol === asset.symbol)
      )
    )
  )

export const getAssetBalance = (balances: BalancesRD, asset: O.Option<Asset>) =>
  pipe(
    sequenceTOption(pipe(balances, RD.toOption), asset),
    O.chain(([balances, asset]) =>
      pipe(
        balances,
        A.findFirst((balance) => balance.symbol === asset.symbol)
      )
    )
  )
