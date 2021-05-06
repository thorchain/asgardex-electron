import {
  getDoubleSwapOutput,
  getDoubleSwapSlip,
  getSwapOutput,
  getSwapSlip,
  getValueOfAsset1InAsset2,
  PoolData
} from '@thorchain/asgardex-util'
import { Asset, assetToString, bn, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../const'
import {
  convertBaseAmountDecimal,
  isChainAsset,
  isRuneNativeAsset,
  max1e8BaseAmount,
  to1e8BaseAmount
} from '../../helpers/assetHelper'
import { eqAsset } from '../../helpers/fp/eq'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { SwapFees } from '../../services/chain/types'
import { PoolAssetDetail, PoolAssetDetails, PoolsDataMap } from '../../services/midgard/types'
import { AssetWithAmount } from '../../types/asgardex'
import { SwapData } from './Swap.types'

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

export const priceFeeAmountForInAsset = ({
  fee,
  inAsset,
  inAssetDecimal,
  poolsData
}: {
  fee: AssetWithAmount
  inAsset: Asset
  inAssetDecimal: number
  poolsData: PoolsDataMap
}): BaseAmount => {
  const { asset: feeAsset, amount: feeAmount } = fee

  // no pricing needed if both assets are the same
  if (eqAsset.equals(feeAsset, inAsset)) return feeAmount

  const oFeeAssetPoolData: O.Option<PoolData> = O.fromNullable(poolsData[assetToString(feeAsset)])
  const oAssetPoolData: O.Option<PoolData> = O.fromNullable(poolsData[assetToString(inAsset)])

  return FP.pipe(
    sequenceTOption(oFeeAssetPoolData, oAssetPoolData),
    O.map(([feeAssetPoolData, assetPoolData]) =>
      // pool data are always 1e8 decimal based
      // and we have to convert fees to 1e8, too
      getValueOfAsset1InAsset2(to1e8BaseAmount(feeAmount), feeAssetPoolData, assetPoolData)
    ),
    // convert decimal back to sourceAssetDecimal
    O.map((amount) => convertBaseAmountDecimal(amount, inAssetDecimal)),
    O.getOrElse(() => baseAmount(0, inAssetDecimal))
  )
}

export const calcRefundFee = (inboundFee: BaseAmount): BaseAmount => inboundFee.times(3)

/**
 * Helper to get min. amount to swap
 *
 * It checks fees for happy path (successfull swap) or unhappy path (failed swap)
 *
 * Formulas based on "Better Fees Handling #1381"
 * @see https://github.com/thorchain/asgardex-electron/issues/1381
 */
export const minAmountToSwapMax1e8 = ({
  swapFees,
  inAsset,
  inAssetDecimal,
  outAsset,
  poolsData
}: {
  swapFees: SwapFees
  inAsset: Asset
  inAssetDecimal: number
  outAsset: Asset
  poolsData: PoolsDataMap
}): BaseAmount => {
  const { inFee, outFee } = swapFees

  const inFeeInInboundAsset = priceFeeAmountForInAsset({
    fee: inFee,
    inAsset,
    inAssetDecimal,
    poolsData
  })

  const outFeeInInboundAsset = priceFeeAmountForInAsset({
    fee: outFee,
    inAsset,
    inAssetDecimal,
    poolsData
  })

  const refundFeeInInboundAsset = calcRefundFee(inFeeInInboundAsset)

  const inAssetIsChainAsset = isChainAsset(inAsset)
  const outAssetIsChainAsset = isChainAsset(outAsset)

  const successSwapFee = inAssetIsChainAsset ? inFeeInInboundAsset.plus(outFeeInInboundAsset) : outFeeInInboundAsset
  const failureSwapFee = outAssetIsChainAsset
    ? inFeeInInboundAsset.plus(refundFeeInInboundAsset)
    : refundFeeInInboundAsset

  const feeToCover: BaseAmount = successSwapFee.gte(failureSwapFee) ? successSwapFee : failureSwapFee

  return FP.pipe(
    // Over-estimate fee by 50%
    1.5,
    feeToCover.times,
    // transform decimal to be `max1e8`
    max1e8BaseAmount
  )
}

/**
 * Returns min. balance to cover fees for inbound chain
 *
 * It checks fees for happy path (successfull swap) or unhappy path (failed swap)
 *
 * This helper is only needed if source asset is not a chain asset,
 * In other case use `minAmountToSwapMax1e8` to get min value
 */
export const minBalanceToSwap = (swapFees: Pick<SwapFees, 'inFee'>): BaseAmount => {
  const {
    inFee: { amount }
  } = swapFees

  // Sum inbound (success swap) + refund fee (failure swap)
  const refundFee = calcRefundFee(amount)
  const feeToCover: BaseAmount = amount.plus(refundFee)
  // Over-estimate balance by 50%
  return feeToCover.times(1.5)
}
