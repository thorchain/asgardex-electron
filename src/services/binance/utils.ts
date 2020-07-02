import { BinanceClient } from '@thorchain/asgardex-binance'
import { Balance } from '@thorchain/asgardex-binance'
import {
  getValueOfAsset1InAsset2,
  PoolData,
  BaseAmount,
  assetToBase,
  assetAmount,
  bnOrZero,
  getAssetFromString,
  AssetTicker,
  getValueOfRuneInAsset
} from '@thorchain/asgardex-util'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { PoolDetails } from '../../services/midgard/types'
import { getPoolDetail, toPoolData } from '../../services/midgard/utils'
import { BinanceClientState, BinanceClientStateM, BinanceClientStateForViews } from './types'

export const getBinanceClient = (clientState: BinanceClientState): O.Option<BinanceClient> =>
  BinanceClientStateM.getOrElse(clientState, () => O.none)

export const hasBinanceClient = (clientState: BinanceClientState): boolean =>
  FP.pipe(clientState, getBinanceClient, O.isSome)

export const getBinanceClientStateForViews = (clientState: BinanceClientState): BinanceClientStateForViews =>
  FP.pipe(
    clientState,
    O.fold(
      // None -> 'notready'
      () => 'notready',
      // Check inner values of Some<Either>
      // Some<Left<Error>> -> 'error
      // Some<Right<BinanceClient>> -> 'ready
      FP.flow(
        E.fold(
          (_) => 'error',
          (_) => 'ready'
        )
      )
    )
  )

/**
 * Helper to get a pool price value for a given `Balance`
 */
export const getPoolPriceValue = (
  { free, symbol }: Balance,
  poolDetails: PoolDetails,
  selectedPricePoolData: PoolData
): O.Option<BaseAmount> => {
  const amount = assetToBase(assetAmount(bnOrZero(free)))
  const oPoolDetail = getPoolDetail(poolDetails, symbol)
  const poolDetail = O.toNullable(oPoolDetail)

  // calculate value based on `pricePoolData`
  if (poolDetail) {
    const poolData = toPoolData(poolDetail)
    return O.some(getValueOfAsset1InAsset2(amount, poolData, selectedPricePoolData))
  }

  const { ticker = '' } = bncSymbolToAsset(symbol)

  // Calculate RUNE values based on `pricePoolData`
  if (ticker === AssetTicker.RUNE) {
    return O.some(getValueOfRuneInAsset(amount, selectedPricePoolData))
  }

  // In all other cases we don't have any price pool and no price
  return O.none
}

/**
 * Converts a BinanceChain symbol to an `Asset`
 **/
export const bncSymbolToAsset = (symbol: string) => getAssetFromString(bncSymbolToAssetString(symbol))

/**
 * Converts a BinanceChain symbol to an `Asset` string
 **/
export const bncSymbolToAssetString = (symbol: string) => `BNB.${symbol}`
