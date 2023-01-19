import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import { Asset, baseAmount, BaseAmount, Chain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/Option'

import { SUPPORTED_LEDGER_APPS, ZERO_BASE_AMOUNT } from '../../../const'
import {
  convertBaseAmountDecimal,
  isChainAsset,
  isUtxoAssetChain,
  max1e8BaseAmount,
  THORCHAIN_DECIMAL,
  to1e8BaseAmount
} from '../../../helpers/assetHelper'
import { getChainAsset } from '../../../helpers/chainHelper'
import { eqChain } from '../../../helpers/fp/eq'
import { priceFeeAmountForAsset } from '../../../services/chain/fees/utils'
import { DepositAssetFees, DepositFees, SymDepositFees, SymDepositFeesRD } from '../../../services/chain/types'
import { PoolsDataMap } from '../../../services/midgard/types'
import { AssetWithAmount } from '../../../types/asgardex'

/**
 * Returns zero sym deposit fees
 * by given paired asset to deposit
 */
export const getZeroSymDepositFees = (asset: Asset): SymDepositFees => ({
  rune: { inFee: ZERO_BASE_AMOUNT, outFee: ZERO_BASE_AMOUNT, refundFee: ZERO_BASE_AMOUNT },
  asset: {
    asset: getChainAsset(asset.chain),
    inFee: ZERO_BASE_AMOUNT,
    outFee: ZERO_BASE_AMOUNT,
    refundFee: ZERO_BASE_AMOUNT
  }
})

export const maxAssetBalanceToDeposit = (assetBalance: AssetWithAmount, inFee: BaseAmount): BaseAmount => {
  const { asset, amount } = assetBalance

  // Ignore non-chain assets
  if (!isChainAsset(asset)) return amount

  const value = amount.minus(inFee)
  const zero = baseAmount(0, amount.decimal)
  return value.gt(zero) ? value : zero
}

export const maxRuneBalanceToDeposit = (runeBalance: BaseAmount, inFee: BaseAmount): BaseAmount => {
  const value = runeBalance.minus(inFee)
  return value.gt(ZERO_BASE_AMOUNT) ? value : ZERO_BASE_AMOUNT
}

/**
 * Calculates max. value of RUNE to deposit
 *
 * @param Object
 * @returns BaseAmount (1e8 decimal)
 */
export const maxRuneAmountToDeposit = ({
  poolData,
  runeBalance,
  assetBalance,
  fees: { asset: assetFees, rune: runeFees }
}: {
  poolData: PoolData
  runeBalance: BaseAmount
  assetBalance: AssetWithAmount
  fees: SymDepositFees
}): BaseAmount => {
  const { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance } = poolData
  const maxRuneBalance = maxRuneBalanceToDeposit(runeBalance, runeFees.inFee)
  const maxAssetBalance = maxAssetBalanceToDeposit(assetBalance, assetFees.inFee)
  // asset balance needs to have `1e8` decimal to be in common with pool data (always `1e8`)
  const maxAssetBalance1e8 = to1e8BaseAmount(maxAssetBalance)
  const maxRuneAmount = baseAmount(
    poolRuneBalance
      .amount()
      .dividedBy(poolAssetBalance.amount())
      .multipliedBy(maxAssetBalance1e8.amount())
      // don't accept decimal as values for `BaseAmount`
      .toFixed(0, BigNumber.ROUND_DOWN),
    THORCHAIN_DECIMAL
  )
  return maxRuneAmount.gte(maxRuneBalance) ? maxRuneBalance : maxRuneAmount
}

/**
 * Calculates max. value of an asset to deposit
 *
 * @param Object
 * @returns BaseAmount - decimal as same as given assetBalance
 */
export const maxAssetAmountToDeposit = ({
  poolData,
  runeBalance,
  assetBalance,
  fees: { asset: assetFees, rune: runeFees }
}: {
  poolData: PoolData
  runeBalance: BaseAmount
  assetBalance: AssetWithAmount
  fees: SymDepositFees
}): BaseAmount => {
  const { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance } = poolData

  const maxRuneBalance = maxRuneBalanceToDeposit(runeBalance, runeFees.inFee)
  const maxAssetBalance = maxAssetBalanceToDeposit(assetBalance, assetFees.inFee)

  // All amounts of pool data are always 1e8 decimal based
  const maxAssetAmount1e8: BaseAmount = baseAmount(
    poolAssetBalance
      .amount()
      .dividedBy(poolRuneBalance.amount())
      .multipliedBy(maxRuneBalance.amount())
      // don't accept decimal as values for `BaseAmount`
      .toFixed(0, BigNumber.ROUND_DOWN),
    THORCHAIN_DECIMAL
  )

  // convert decimal to original decimal of assetBalance
  const maxAssetAmount = convertBaseAmountDecimal(maxAssetAmount1e8, assetBalance.amount.decimal)

  return maxAssetAmount.gt(maxAssetBalance) ? maxAssetBalance : maxAssetAmount
}

export const getRuneAmountToDeposit = (
  assetAmount: BaseAmount,
  { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance }: PoolData
): BaseAmount => {
  // convert `assetAmount` to `1e8` to be similar with decimal of `PoolData`, which are always 1e8 decimal based
  const assetAmount1e8 = to1e8BaseAmount(assetAmount)
  return baseAmount(
    // formula: assetAmount * poolRuneBalance / poolAssetBalance
    assetAmount1e8.amount().times(poolRuneBalance.amount().dividedBy(poolAssetBalance.amount())),
    THORCHAIN_DECIMAL
  )
}

/**
 *
 * @param runeAmount
 * @param PoolData
 * @returns BaseAmount to deposit based on max. 1e8 decmial
 */
export const getAssetAmountToDeposit = ({
  runeAmount,
  poolData,
  assetDecimal
}: {
  runeAmount: BaseAmount
  poolData: PoolData
  assetDecimal: number
}): BaseAmount => {
  const { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance } = poolData
  const assetAmountToDeposit1e8 =
    // formula: runeAmount * poolRuneBalance / poolAssetBalance
    // Note: pool data are always 1e8 based,
    baseAmount(
      runeAmount
        .amount()
        .times(poolAssetBalance.amount().dividedBy(poolRuneBalance.amount())) // don't accept decimal as values for `BaseAmount`
        .toFixed(0, BigNumber.ROUND_DOWN),
      THORCHAIN_DECIMAL
    )

  // Convert `assetAmountToDeposit1e8` back to original assetDecimal (it might be less than 1e8)
  const assetAmountToDeposit = convertBaseAmountDecimal(assetAmountToDeposit1e8, assetDecimal)
  // And convert it again to have max. 1e8 (it might be greater by using assetDecimal before)
  return max1e8BaseAmount(assetAmountToDeposit)
}

export const getAssetChainFee = (feesRD: SymDepositFeesRD): O.Option<DepositAssetFees> =>
  FP.pipe(
    feesRD,
    RD.map(({ asset }) => asset),
    RD.toOption
  )

export const getThorchainFees = (feesRD: SymDepositFeesRD): O.Option<DepositFees> =>
  FP.pipe(
    feesRD,
    RD.map(({ rune }) => rune),
    RD.toOption
  )

export const minAssetAmountToDepositMax1e8 = ({
  fees,
  asset,
  assetDecimal,
  poolsData
}: {
  /* fee for deposit */
  fees: DepositAssetFees
  /* asset to deposit */
  asset: Asset
  assetDecimal: number
  poolsData: PoolsDataMap
}): BaseAmount => {
  const { asset: feeAsset, inFee, outFee, refundFee } = fees

  const inFeeInAsset = isChainAsset(asset)
    ? inFee
    : priceFeeAmountForAsset({
        feeAmount: inFee,
        feeAsset,
        asset,
        assetDecimal,
        poolsData
      })

  const outFeeInAsset = isChainAsset(asset)
    ? outFee
    : priceFeeAmountForAsset({
        feeAmount: outFee,
        feeAsset,
        asset,
        assetDecimal,
        poolsData
      })

  const refundFeeInAsset = isChainAsset(asset)
    ? refundFee
    : priceFeeAmountForAsset({
        feeAmount: refundFee,
        feeAsset,
        asset,
        assetDecimal,
        poolsData
      })

  const successDepositFee = inFeeInAsset.plus(outFeeInAsset)
  const failureDepositFee = inFeeInAsset.plus(refundFeeInAsset)

  const feeToCover: BaseAmount = successDepositFee.gte(failureDepositFee) ? successDepositFee : failureDepositFee

  return FP.pipe(
    // Over-estimate fee by 50%
    1.5,
    feeToCover.times,
    // transform decimal to be `max1e8`
    max1e8BaseAmount,
    // Zero amount is possible only in case there is not fees information loaded.
    // Just to avoid blinking min value filter out zero min amounts too.
    E.fromPredicate((amount) => amount.eq(0) || !isUtxoAssetChain(asset), FP.identity),
    // increase min value by 10k satoshi (for meaningful UTXO assets' only)
    E.getOrElse((amount) => amount.plus(10000))
  )
}

export const minRuneAmountToDeposit = ({ inFee, outFee, refundFee }: DepositFees): BaseAmount => {
  const successDepositFee = inFee.plus(outFee)
  const failureDepositFee = inFee.plus(refundFee)

  const feeToCover: BaseAmount = successDepositFee.gte(failureDepositFee) ? successDepositFee : failureDepositFee

  return FP.pipe(
    // Over-estimate fee by 50%
    1.5,
    feeToCover.times
  )
}

/**
 * Returns min. balance to cover fees for deposit txs
 *
 * It sums fees for happy path (successfull deposit) or unhappy path (failed deposit)
 *
 * This helper is only needed if source asset is not a chain asset,
 * In other case use `minAmountToSwapMax1e8` to get min value
 */
export const minBalanceToDeposit = (fees: Pick<DepositFees, 'inFee' | 'refundFee'>): BaseAmount => {
  const { inFee, refundFee } = fees

  // Sum inbound (success deposit) + refund fee (failure deposit)
  const feeToCover: BaseAmount = inFee.plus(refundFee)
  // Over-estimate balance by 50%
  return feeToCover.times(1.5)
}

export const getWalletType = (chain: Chain, useLedger: boolean) =>
  FP.pipe(
    SUPPORTED_LEDGER_APPS,
    A.findFirst((chainInList) => eqChain.equals(chainInList, chain)),
    O.map((_) => (useLedger ? 'ledger' : 'keystore'))
  )
