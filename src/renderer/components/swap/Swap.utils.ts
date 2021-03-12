import { getDoubleSwapOutput, getDoubleSwapSlip, getSwapOutput, getSwapSlip, PoolData } from '@thorchain/asgardex-util'
import { Asset, assetToString, bn, BaseAmount, baseToAsset, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../const'
import { isRuneNativeAsset } from '../../helpers/assetHelper'
import { eqAsset } from '../../helpers/fp/eq'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { PoolAssetDetail, PoolAssetDetails } from '../../services/midgard/types'

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

export const getSlip = (
  sourceAsset: Asset,
  targetAsset: Asset,
  changeAmount: BaseAmount,
  pools: Record<string, PoolData>
) =>
  FP.pipe(
    isRuneSwap(sourceAsset, targetAsset),
    O.chain((toRune) =>
      FP.pipe(
        O.fromNullable(pools[assetToString(targetAsset)]),
        O.map((targetPoolData) => getSwapSlip(changeAmount, targetPoolData, toRune))
      )
    ),
    O.alt(() =>
      FP.pipe(
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
): BaseAmount =>
  FP.pipe(
    isRuneSwap(sourceAsset, targetAsset),
    O.chain((toRune) => {
      const assetSymbol = assetToString(toRune ? sourceAsset : targetAsset)
      return FP.pipe(
        O.fromNullable(pools[assetSymbol]),
        O.map((poolData) => getSwapOutput(changeAmount, poolData, toRune))
      )
    }),
    O.alt(() =>
      FP.pipe(
        sequenceTOption(
          O.fromNullable(pools[assetToString(sourceAsset)]),
          O.fromNullable(pools[assetToString(targetAsset)])
        ),
        O.map(([source, target]) => getDoubleSwapOutput(changeAmount, source, target))
      )
    ),
    O.getOrElse(() => ZERO_BASE_AMOUNT)
  )

export type SwapData = {
  readonly slip: BigNumber
  readonly swapResult: BaseAmount
}

export const DEFAULT_SWAP_DATA: SwapData = {
  slip: ZERO_BN,
  swapResult: ZERO_BASE_AMOUNT
}

export const convertToBase8 = (amount: BaseAmount) => assetToBase(assetAmount(baseToAsset(amount).amount(), 8))

export const getSwapData = (
  swapAmount: BaseAmount,
  sourceAsset: O.Option<Asset>,
  targetAsset: O.Option<Asset>,
  pools: Record<string, PoolData>
): SwapData =>
  FP.pipe(
    sequenceTOption(sourceAsset, targetAsset),
    O.map(([sourceAsset, targetAsset]) => {
      swapAmount = convertToBase8(swapAmount)
      const slip = getSlip(sourceAsset, targetAsset, swapAmount, pools)
      const swapResult = getSwapResult(sourceAsset, targetAsset, swapAmount, pools)
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
