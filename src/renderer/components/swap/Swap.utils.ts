import { getDoubleSwapOutput, getDoubleSwapSlip, getSwapOutput, getSwapSlip } from '@thorchain/asgardex-util'
import { Asset, assetToString, bn, BaseAmount, baseAmount, Chain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { isLedgerWallet } from '../../../shared/utils/guard'
import { ASGARDEX_SWAP_IDENTIFIER, ZERO_BASE_AMOUNT } from '../../const'
import {
  isChainAsset,
  isRuneNativeAsset,
  isUtxoAssetChain,
  max1e8BaseAmount,
  to1e8BaseAmount
} from '../../helpers/assetHelper'
import { eqAsset, eqChain } from '../../helpers/fp/eq'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { priceFeeAmountForAsset } from '../../services/chain/fees/utils'
import { SwapFees } from '../../services/chain/types'
import { PoolAssetDetail, PoolAssetDetails, PoolsDataMap } from '../../services/midgard/types'
import { WalletBalances } from '../../services/wallet/types'
import { SlipTolerance } from '../../types/asgardex'
import { AssetsToSwap, SwapData } from './Swap.types'
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

export const getSlipPercent = ({
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
        O.fromNullable(poolsData[assetToString(isRuneNativeAsset(targetAsset) ? sourceAsset : targetAsset)]),
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
    O.map((slip) => slip.times(100)),
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
  sourceAsset: Asset
  targetAsset: Asset
  poolsData: PoolsDataMap
}): SwapData => {
  const slip = getSlipPercent({ sourceAsset, targetAsset, amountToSwap, poolsData })
  const swapResult = getSwapResult({ sourceAsset, targetAsset, amountToSwap, poolsData })
  return {
    slip,
    swapResult
  }
}

/**
 * Returns `BaseAmount` with asgardex identifier counted into the limit
 * It's always `1e8` based (default by THORChain)
 */
export const getSwapLimit1e8 = (swapResultAmountMax1e8: BaseAmount, slipTolerance: SlipTolerance): BaseAmount => {
  const swapLimit: BaseAmount = swapResultAmountMax1e8.times(1.0 - slipTolerance * 0.01)
  const swapLimit1e8: BaseAmount = to1e8BaseAmount(swapLimit)
  const swapLimitWithIdentifier =
    +swapLimit1e8.amount().toString().slice(0, -3).concat(ASGARDEX_SWAP_IDENTIFIER.toString()) - 1000

  return baseAmount(
    bn(swapLimitWithIdentifier <= ASGARDEX_SWAP_IDENTIFIER ? ASGARDEX_SWAP_IDENTIFIER : swapLimitWithIdentifier),
    swapLimit1e8.decimal
  )
}

export const pickPoolAsset = (assets: PoolAssetDetails, asset: Asset): O.Option<PoolAssetDetail> =>
  FP.pipe(
    assets,
    A.findFirst(({ asset: availableAsset }) => eqAsset.equals(availableAsset, asset)),
    O.alt(() => FP.pipe(assets, A.head))
  )

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

  const inFeeInInboundAsset = priceFeeAmountForAsset({
    feeAmount: inFee.amount,
    feeAsset: inFee.asset,
    asset: inAsset,
    assetDecimal: inAssetDecimal,
    poolsData
  })

  const outFeeInInboundAsset = priceFeeAmountForAsset({
    feeAmount: outFee.amount,
    feeAsset: outFee.asset,
    asset: inAsset,
    assetDecimal: inAssetDecimal,
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
    max1e8BaseAmount,
    // Zero amount is possible only in case there is not fees information loaded.
    // Just to avoid blinking min value filter out zero min amounts too.
    E.fromPredicate((amount) => amount.eq(0) || !isUtxoAssetChain(inAsset), FP.identity),
    // increase min value by 10k satoshi (for meaningful UTXO assets' only)
    E.getOrElse((amount) => amount.plus(10000))
  )
}

/**
 * Returns min. balance to cover fees for inbound chain
 *
 * It sums fees for happy path (successfull swap) and unhappy path (failed swap)
 *
 * This helper is only needed if source asset is not a chain asset,
 * In other case use `minAmountToSwapMax1e8` to get min value
 */
export const minBalanceToSwap = (swapFees: Pick<SwapFees, 'inFee'>): BaseAmount => {
  const {
    inFee: { amount: inFeeAmount }
  } = swapFees

  // Sum inbound (success swap) + refund fee (failure swap)
  const refundFee = calcRefundFee(inFeeAmount)
  const feeToCover: BaseAmount = inFeeAmount.plus(refundFee)
  // Over-estimate balance by 50%
  return feeToCover.times(1.5)
}

/**
 * Helper to calculate balance available to swap by considering possible fees
 *
 * @param assetAmountMax1e8 Balances of source asset - max 1e8
 * @param sourceAsset Source asset to swap from
 * @param inFeeAmount fee of inbound tx
 *
 * @returns BaseAmount available to swap from
 */
export const calcAmountToSwapMax1e8 = ({
  amountToSwapMax1e8,
  sourceAsset,
  inFeeAmount
}: {
  amountToSwapMax1e8: BaseAmount
  sourceAsset: Asset
  inFeeAmount: BaseAmount
}): BaseAmount => {
  // No chain asset, no fee
  if (!isChainAsset(sourceAsset)) return amountToSwapMax1e8
  // In case of chain asset
  // fees needs to be deducted
  const amountToSwap = amountToSwapMax1e8.minus(max1e8BaseAmount(inFeeAmount))
  return amountToSwap.gt(baseAmount(0)) ? amountToSwap : baseAmount(0, amountToSwapMax1e8.decimal)
}

export const assetsInWallet: (_: WalletBalances) => Asset[] = FP.flow(A.map(({ asset }) => asset))

export const balancesToSwapFrom = ({
  assetsToSwap,
  walletBalances
}: {
  assetsToSwap: O.Option<AssetsToSwap>
  walletBalances: WalletBalances
}): WalletBalances => {
  const walletAssets = assetsInWallet(walletBalances)

  const filteredBalances: WalletBalances = FP.pipe(
    walletBalances,
    A.filter((balance) => walletAssets.includes(balance.asset)),
    (balances) => (balances.length ? balances : walletBalances)
  )

  return FP.pipe(
    assetsToSwap,
    O.map(({ source }) =>
      FP.pipe(
        filteredBalances,
        A.filter((balance) => !eqAsset.equals(balance.asset, source))
      )
    ),
    O.getOrElse(() => walletBalances)
  )
}

export const hasLedgerInBalancesByChain = (chain: Chain, balances: WalletBalances): boolean =>
  FP.pipe(
    balances,
    A.findFirst(({ walletType, asset }) => eqChain.equals(chain, asset.chain) && isLedgerWallet(walletType)),
    O.fold(
      () => false,
      () => true
    )
  )
