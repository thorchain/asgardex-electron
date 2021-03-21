import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import { baseAmount, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import {
  convertBaseAmountDecimal,
  max1e8BaseAmount,
  THORCHAIN_DECIMAL,
  to1e8BaseAmount
} from '../../../helpers/assetHelper'
import { DepositFeesRD } from '../../../services/chain/types'

/**
 * Calculates max. value of RUNE to deposit
 *
 * @param Object
 * @returns BaseAmount (1e8 decimal)
 */
export const maxRuneAmountToDeposit = ({
  poolData,
  runeBalance,
  assetBalance
}: {
  poolData: PoolData
  runeBalance: BaseAmount
  assetBalance: BaseAmount
}): BaseAmount => {
  const { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance } = poolData
  // asset balance needs to have `1e8` decimal to be in common with pool data (always `1e8`)
  const assetBalance1e8 = to1e8BaseAmount(assetBalance)
  const maxRuneAmount = baseAmount(
    poolRuneBalance
      .amount()
      .dividedBy(poolAssetBalance.amount())
      .multipliedBy(assetBalance1e8.amount())
      // don't accept decimal as values for `BaseAmount`
      .toFixed(0, BigNumber.ROUND_DOWN),
    THORCHAIN_DECIMAL
  )

  return maxRuneAmount.amount().isGreaterThan(runeBalance.amount()) ? runeBalance : maxRuneAmount
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
  assetBalance
}: {
  poolData: PoolData
  runeBalance: BaseAmount
  assetBalance: BaseAmount
}): BaseAmount => {
  const { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance } = poolData

  // All amounts of pool data are always 1e8 decimal based
  const maxAssetAmount1e8: BaseAmount = baseAmount(
    poolAssetBalance
      .amount()
      .dividedBy(poolRuneBalance.amount())
      .multipliedBy(runeBalance.amount())
      // don't accept decimal as values for `BaseAmount`
      .toFixed(0, BigNumber.ROUND_DOWN),
    THORCHAIN_DECIMAL
  )

  // convert decimal to original decimal of assetBalance
  const maxAssetAmount = convertBaseAmountDecimal(maxAssetAmount1e8, assetBalance.decimal)

  return maxAssetAmount.amount().isGreaterThan(assetBalance.amount()) ? assetBalance : maxAssetAmount
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

export const getAssetChainFee = (feesRD: DepositFeesRD): O.Option<BaseAmount> =>
  FP.pipe(
    feesRD,
    RD.map(({ asset }) => asset),
    RD.toOption
  )

export const getThorchainFees = (feesRD: DepositFeesRD): O.Option<BaseAmount> =>
  FP.pipe(
    feesRD,
    RD.map(({ thor }) => thor),
    FP.flow(RD.toOption, O.flatten)
  )
