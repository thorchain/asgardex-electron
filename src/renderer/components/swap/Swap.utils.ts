import { getDoubleSwapOutput, getDoubleSwapSlip, getSwapOutput, getSwapSlip } from '@thorchain/asgardex-util'
import { Asset, assetToString, bn, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../const'
import { isRuneNativeAsset, to1e8BaseAmount } from '../../helpers/assetHelper'
import { eqAsset } from '../../helpers/fp/eq'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { PoolAssetDetail, PoolAssetDetails, PoolsDataMap } from '../../services/midgard/types'

/**
 * @returns none - neither sourceAsset neither targetAsset is RUNE
 *          some(true) - targetAsset is RUNE
 *          some(false) - sourceAsset is RUNE
 */
export const isRuneSwap = (sourceAsset: Asset, targetAsset: Asset) => {
  if (isRuneNativeAsset(targetAsset)) {
    return O.some(true)
  }

  if (isRuneNativeAsset(sourceAsset)) {
    return O.some(false)
  }

  return O.none
}

export const getSlip = ({
  sourceAsset,
  targetAsset,
  amountToSwap,
  poolsData
}: {
  sourceAsset: Asset
  targetAsset: Asset
  amountToSwap: BaseAmount
  poolsData: PoolsDataMap
}): BigNumber => {
  // pool data provided by Midgard are always 1e8 decimal based
  // that's why we have to convert `amountToSwap into `1e8` decimal as well
  const inputAmount = to1e8BaseAmount(amountToSwap)
  return FP.pipe(
    isRuneSwap(sourceAsset, targetAsset),
    O.chain((toRune) =>
      FP.pipe(
        O.fromNullable(poolsData[assetToString(targetAsset)]),
        O.map((targetPoolData) => getSwapSlip(inputAmount, targetPoolData, toRune))
      )
    ),
    O.alt(() =>
      FP.pipe(
        sequenceTOption(
          O.fromNullable(poolsData[assetToString(sourceAsset)]),
          O.fromNullable(poolsData[assetToString(targetAsset)])
        ),
        O.map(([source, target]) => getDoubleSwapSlip(inputAmount, source, target))
      )
    ),
    O.getOrElse(() => bn(0))
  )
}

/**
 * Result of swap
 *
 * Note: Returned `amountToSwap` is `1e8` decimal based
 */
export const getSwapResult = ({
  sourceAsset,
  targetAsset,
  amountToSwap,
  poolsData
}: {
  sourceAsset: Asset
  targetAsset: Asset
  amountToSwap: BaseAmount
  poolsData: PoolsDataMap
}): BaseAmount => {
  // pool data provided by Midgard are always 1e8 decimal based,
  // that's why we have to convert `amountToSwap into `1e8` as well
  const inputAmount = to1e8BaseAmount(amountToSwap)
  return FP.pipe(
    isRuneSwap(sourceAsset, targetAsset),
    O.chain((toRune) => {
      const assetSymbol = assetToString(toRune ? sourceAsset : targetAsset)
      return FP.pipe(
        O.fromNullable(poolsData[assetSymbol]),
        O.map((poolData) => getSwapOutput(inputAmount, poolData, toRune))
      )
    }),
    O.alt(() =>
      FP.pipe(
        sequenceTOption(
          O.fromNullable(poolsData[assetToString(sourceAsset)]),
          O.fromNullable(poolsData[assetToString(targetAsset)])
        ),
        O.map(([source, target]) => getDoubleSwapOutput(inputAmount, source, target))
      )
    ),
    O.getOrElse(() => ZERO_BASE_AMOUNT)
  )
}

export type SwapData = {
  readonly slip: BigNumber
  readonly swapResult: BaseAmount
}

export const DEFAULT_SWAP_DATA: SwapData = {
  slip: ZERO_BN,
  swapResult: ZERO_BASE_AMOUNT
}

/**
 * Returns `SwapData`
 *
 * Note: `amountToSwap` of `swapResult` is `1e8` decimal based
 */
export const getSwapData = ({
  amountToSwap,
  sourceAsset,
  targetAsset,
  poolsData
}: {
  amountToSwap: BaseAmount
  sourceAsset: O.Option<Asset>
  targetAsset: O.Option<Asset>
  poolsData: PoolsDataMap
}): SwapData =>
  FP.pipe(
    sequenceTOption(sourceAsset, targetAsset),
    O.map(([sourceAsset, targetAsset]) => {
      const slip = getSlip({ sourceAsset, targetAsset, amountToSwap, poolsData })
      const swapResult = getSwapResult({ sourceAsset, targetAsset, amountToSwap, poolsData })
      return {
        slip,
        swapResult
      }
    }),
    O.getOrElse(() => DEFAULT_SWAP_DATA)
  )

export const pickPoolAsset = (assets: PoolAssetDetails, asset: Asset): O.Option<PoolAssetDetail> =>
  FP.pipe(
    assets,
    A.findFirst(({ asset: availableAsset }) => eqAsset.equals(availableAsset, asset)),
    O.alt(() => FP.pipe(assets, A.head))
  )

export const poolAssetDetailToAsset = (oAsset: O.Option<PoolAssetDetail>): O.Option<Asset> =>
  FP.pipe(
    oAsset,
    O.map(({ asset }) => asset)
  )
