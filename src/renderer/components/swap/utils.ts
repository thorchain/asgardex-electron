import {
  Asset,
  assetAmount,
  assetToBase,
  assetToString,
  baseToAsset,
  getDoubleSwapOutput,
  getDoubleSwapSlip,
  getSwapOutput,
  getSwapSlip,
  PoolData,
  bn,
  BaseAmount
} from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'

import { isRuneAsset } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { AssetWithPrice } from '../../services/binance/types'

const getAssetFormat = (symbol: string) => {
  return `BNB.${symbol}`
}

export const getSwapMemo = (symbol: string, addr: string, sliplimit = '') =>
  `SWAP:${getAssetFormat(symbol)}${addr ? `:${addr}` : ''}${sliplimit ? `:${sliplimit}` : ''}`

/**
 * @returns none - neither sourceAsset neither targetAsset is RUNE
 *          some(true) - targetAsset is RUNE
 *          some(false) - sourceAsset is RUNE
 */
const isRuneSwap = (sourceAsset: Asset, targetAsset: Asset) => {
  if (isRuneAsset(targetAsset)) {
    return O.some(true)
  }

  if (isRuneAsset(sourceAsset)) {
    return O.some(false)
  }

  return O.none
}

const getSlip = (
  sourceAsset: Asset,
  targetAsset: Asset,
  changeAmount: BaseAmount,
  pools: Record<string, PoolData>,
  runeSwap: O.Option<boolean> = O.none
) =>
  pipe(
    runeSwap,
    O.map((toRune) => {
      const targetPoolData = pools[assetToString(targetAsset)]
      return getSwapSlip(changeAmount, targetPoolData, toRune)
    }),
    O.alt(() =>
      pipe(
        sequenceTOption(
          O.fromNullable(pools[assetToString(sourceAsset)]),
          O.fromNullable(pools[assetToString(targetAsset)])
        ),
        O.map(([source, target]) => getDoubleSwapSlip(changeAmount, source, target))
      )
    ),
    O.getOrElse(() => bn(0))
  )

const getSwapResult = (
  sourceAsset: Asset,
  targetAsset: Asset,
  changeAmount: BaseAmount,
  pools: Record<string, PoolData>,
  runeSwap: O.Option<boolean> = O.none
) =>
  pipe(
    runeSwap,
    O.chain((toRune) => {
      const assetSymbol = assetToString(toRune ? sourceAsset : targetAsset)
      return pipe(
        O.fromNullable(pools[assetSymbol]),
        O.map((poolData) => getSwapOutput(changeAmount, poolData, toRune))
      )
    }),
    O.alt(() =>
      pipe(
        sequenceTOption(
          O.fromNullable(pools[assetToString(sourceAsset)]),
          O.fromNullable(pools[assetToString(targetAsset)])
        ),
        O.map(([source, target]) => getDoubleSwapOutput(changeAmount, source, target))
      )
    ),
    O.map((swapResult) => baseToAsset(swapResult).amount()),
    O.getOrElse(() => bn(0))
  )

const defaultSwapData = {
  slip: bn(0),
  swapResult: bn(0)
}

export const getSwapData = (
  swapAmount: BigNumber,
  sourceAsset: O.Option<Asset>,
  targetAsset: O.Option<Asset>,
  pools: Record<string, PoolData>
) => {
  return pipe(
    sequenceTOption(sourceAsset, targetAsset),
    O.map(([sourceAsset, targetAsset]) => {
      const runeSwap = isRuneSwap(sourceAsset, targetAsset)
      const swapBaseAmount = assetToBase(assetAmount(swapAmount))
      const slip = getSlip(sourceAsset, targetAsset, swapBaseAmount, pools, runeSwap)
      const swapResult = getSwapResult(sourceAsset, targetAsset, swapBaseAmount, pools, runeSwap)
      return {
        slip,
        swapResult
      }
    }),
    O.getOrElse(() => defaultSwapData)
  )
}

export const pickAssetPair = (availableAssets: AssetWithPrice[], asset: O.Option<Asset>) =>
  pipe(
    asset,
    O.chain((sourceAsset) =>
      pipe(
        availableAssets,
        A.findFirst((asset) => sourceAsset.symbol === asset.asset.symbol)
      )
    ),
    O.alt(() => pipe(availableAssets, A.head))
  )

export const pairAssetToPlain = (pair: O.Option<AssetWithPrice>) =>
  pipe(
    pair,
    O.map((pair) => pair.asset)
  )
