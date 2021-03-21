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
  const assetBalance_1e8 = to1e8BaseAmount(assetBalance)
  const maxRuneAmountBN = poolRuneBalance
    .amount()
    .dividedBy(poolAssetBalance.amount())
    .multipliedBy(assetBalance_1e8.amount())

  return maxRuneAmountBN.isGreaterThan(runeBalance.amount())
    ? runeBalance
    : baseAmount(maxRuneAmountBN, THORCHAIN_DECIMAL)
}

/**
 * Calculates max. value of an asset to deposit
 *
 * @param Object
 * @returns BaseAmount - max. 1e8 decimal based
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

  // amounts of pool data are always 1e8 decimal based - no convertion needed at this level
  const maxAssetAmountBN: BigNumber = poolAssetBalance
    .amount()
    .dividedBy(poolRuneBalance.amount())
    .multipliedBy(runeBalance.amount())

  const maxAssetAmounte1e8 = baseAmount(maxAssetAmountBN, THORCHAIN_DECIMAL)
  // convert decimal to original decimal of assetBalance
  const maxAssetAmount = convertBaseAmountDecimal(maxAssetAmounte1e8, assetBalance.decimal)
  // compare `maxAssetAmount` with `assetBalance`
  return maxAssetAmount.amount().isGreaterThan(assetBalance.amount())
    ? max1e8BaseAmount(assetBalance)
    : max1e8BaseAmount(maxAssetAmount)
}

export const getRuneAmountToDeposit = (
  assetAmount: BaseAmount,
  { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance }: PoolData
): BaseAmount => {
  // convert `assetAmount` to `1e8` to be similar with decimal of `PoolData`, which are always 1e8 decimal based
  const assetAmount_1e8 = to1e8BaseAmount(assetAmount)
  return baseAmount(
    // formula: assetAmount * poolRuneBalance / poolAssetBalance
    assetAmount_1e8.amount().times(poolRuneBalance.amount().dividedBy(poolAssetBalance.amount())),
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
  const assetAmountToDepositBN =
    // formula: runeAmount * poolRuneBalance / poolAssetBalance
    runeAmount.amount().times(poolAssetBalance.amount().dividedBy(poolRuneBalance.amount()))

  // Note: 3 steps to convert decimal are needed
  // (1) pool data are always 1e8 based, that's why we do need to convert it into 1e8 first
  const assetAmountToDeposit1e8 = baseAmount(assetAmountToDepositBN, THORCHAIN_DECIMAL)
  // (2) convert it again based on original assetDecimal (it might be less than 1e8)
  const assetAmountToDeposit = convertBaseAmountDecimal(assetAmountToDeposit1e8, assetDecimal)
  // (3) convert it again to have max. 1e8 (it might be greater by using assetDecimal before)
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
