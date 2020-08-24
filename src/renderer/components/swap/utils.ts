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
  getSwapFee,
  getDoubleSwapFee
} from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'

import { isRuneAsset } from '../../helpers/assetHelper'

const getAssetFormat = (symbol: string) => {
  return `BNB.${symbol}`
}

export const getSwapMemo = (symbol: string, addr: string, sliplimit = '') =>
  `SWAP:${getAssetFormat(symbol)}:${addr}:${sliplimit}`

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
  changeAmount: BigNumber,
  pools: Record<string, PoolData>,
  runeSwap: O.Option<boolean> = O.none
) =>
  pipe(
    runeSwap,
    O.map((toRune) => {
      const targetPoolData = pools[assetToString(targetAsset)]
      return getSwapSlip(assetToBase(assetAmount(changeAmount)), targetPoolData, toRune)
    }),
    O.getOrElse(() =>
      getDoubleSwapSlip(
        assetToBase(assetAmount(changeAmount)),
        pools[assetToString(sourceAsset)],
        pools[assetToString(targetAsset)]
      )
    )
  )

const getSwapResult = (
  sourceAsset: Asset,
  targetAsset: Asset,
  changeAmount: BigNumber,
  pools: Record<string, PoolData>,
  slip: BigNumber,
  runeSwap: O.Option<boolean> = O.none
) =>
  pipe(
    runeSwap,
    O.map((toRune) => {
      const assetSymbol = assetToString(runeSwap ? sourceAsset : targetAsset)
      const targetPoolData = pools[assetSymbol]
      return baseToAsset(getSwapOutput(assetToBase(assetAmount(changeAmount)), targetPoolData, toRune))
        .amount()
        .multipliedBy(bn(1).minus(slip))
    }),
    O.getOrElse(() => {
      const res = getDoubleSwapOutput(
        assetToBase(assetAmount(changeAmount)),
        pools[assetToString(sourceAsset)],
        pools[assetToString(targetAsset)]
      )

      return baseToAsset(res).amount().multipliedBy(bn(1).minus(slip))
    })
  )

const getFee = (
  sourceAsset: Asset,
  targetAsset: Asset,
  changeAmount: BigNumber,
  pools: Record<string, PoolData>,
  runeSwap: O.Option<boolean> = O.none
) =>
  pipe(
    runeSwap,
    O.map((toRune) => {
      const targetPoolData = pools[assetToString(targetAsset)]
      return getSwapFee(assetToBase(assetAmount(changeAmount)), targetPoolData, toRune)
    }),
    O.getOrElse(() =>
      getDoubleSwapFee(
        assetToBase(assetAmount(changeAmount)),
        pools[assetToString(sourceAsset)],
        pools[assetToString(targetAsset)]
      )
    )
  )

export const getSwapData = (
  swapAmount: BigNumber,
  sourceAsset: Asset,
  targetAsset: Asset,
  pools: Record<string, PoolData>
) => {
  const runeSwap = isRuneSwap(sourceAsset, targetAsset)
  const slip = getSlip(sourceAsset, targetAsset, swapAmount, pools, runeSwap)
  const swapResult = getSwapResult(sourceAsset, targetAsset, swapAmount, pools, slip, runeSwap)

  return {
    slip,
    swapResult,
    fee: baseToAsset(getFee(sourceAsset, targetAsset, swapAmount, pools, runeSwap)).amount()
  }
}
