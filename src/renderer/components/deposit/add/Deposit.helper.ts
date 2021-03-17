import { PoolData } from '@thorchain/asgardex-util'
import { baseAmount, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { THORCHAIN_DECIMAL } from '../../../helpers/assetHelper'

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
  const maxRuneAmount = poolRuneBalance
    .amount()
    .dividedBy(poolAssetBalance.amount())
    .multipliedBy(assetBalance.amount())
  return maxRuneAmount.isGreaterThan(runeBalance.amount()) ? runeBalance : baseAmount(maxRuneAmount)
}

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
  const maxAssetAmountBN: BigNumber = poolAssetBalance
    .amount()
    .dividedBy(poolRuneBalance.amount())
    .multipliedBy(runeBalance.amount())
    .multipliedBy(Math.pow(10, assetBalance.decimal - 8))
  // console.log(111, maxAssetAmountBN.)
  return maxAssetAmountBN.isGreaterThanOrEqualTo(assetBalance.amount())
    ? assetBalance
    : baseAmount(maxAssetAmountBN, assetBalance.decimal)
}

export const getRuneAmountToDeposit = (
  assetAmount: BaseAmount,
  { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance }: PoolData
): BaseAmount =>
  baseAmount(
    // formula: assetAmount * poolRuneBalance / poolAssetBalance
    assetAmount.amount().times(poolRuneBalance.amount().dividedBy(poolAssetBalance.amount())),
    THORCHAIN_DECIMAL
  )

export const getAssetAmountToDeposit = (
  runeAmount: BaseAmount,
  { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance }: PoolData
): BaseAmount =>
  baseAmount(
    // formula: runeAmount * poolRuneBalance / poolAssetBalance
    runeAmount.amount().times(poolAssetBalance.amount().dividedBy(poolRuneBalance.amount())),
    poolAssetBalance.decimal
  )
