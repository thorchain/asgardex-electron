import { getDoubleSwapOutput, getDoubleSwapSlip, getSwapOutput, getSwapSlip, PoolData } from '@thorchain/asgardex-util'
import { Asset, assetAmount, assetToBase, assetToString, baseToAsset, bn, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'

import { isRuneAsset } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { AssetWithPrice } from '../../services/binance/types'

/**
 * @returns none - neither sourceAsset neither targetAsset is RUNE
 *          some(true) - targetAsset is RUNE
 *          some(false) - sourceAsset is RUNE
 */
export const isRuneSwap = (sourceAsset: Asset, targetAsset: Asset) => {
  if (isRuneAsset(targetAsset)) {
    return O.some(true)
  }

  if (isRuneAsset(sourceAsset)) {
    return O.some(false)
  }

  return O.none
}

export const getSlip = (
  sourceAsset: Asset,
  targetAsset: Asset,
  changeAmount: BaseAmount,
  pools: Record<string, PoolData>
) =>
  pipe(
    isRuneSwap(sourceAsset, targetAsset),
    O.chain((toRune) =>
      pipe(
        O.fromNullable(pools[assetToString(targetAsset)]),
        O.map((targetPoolData) => getSwapSlip(changeAmount, targetPoolData, toRune))
      )
    ),
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

export const getSwapResult = (
  sourceAsset: Asset,
  targetAsset: Asset,
  changeAmount: BaseAmount,
  pools: Record<string, PoolData>
) =>
  pipe(
    isRuneSwap(sourceAsset, targetAsset),
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
      const swapBaseAmount = assetToBase(assetAmount(swapAmount))
      const slip = getSlip(sourceAsset, targetAsset, swapBaseAmount, pools)
      const swapResult = getSwapResult(sourceAsset, targetAsset, swapBaseAmount, pools)
      return {
        slip,
        swapResult
      }
    }),
    O.getOrElse(() => defaultSwapData)
  )
}

export const pickAssetWithPrice = (availableAssets: AssetWithPrice[], asset: O.Option<Asset>) =>
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

export const assetWithPriceToAsset = (oAssetWP: O.Option<AssetWithPrice>) =>
  pipe(
    oAssetWP,
    O.map((assetWP) => assetWP.asset)
  )
