import { PoolData } from '@thorchain/asgardex-util'
import { baseAmount, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { convertBaseAmountDecimal, THORCHAIN_DECIMAL } from '../../../helpers/assetHelper'

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
  const maxRuneAmountBN = poolRuneBalance
    .amount()
    .dividedBy(poolAssetBalance.amount())
    .multipliedBy(assetBalance.amount())
  return maxRuneAmountBN.isGreaterThan(runeBalance.amount())
    ? runeBalance
    : baseAmount(maxRuneAmountBN, THORCHAIN_DECIMAL)
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

  // update decimal for pool asset
  const maxAssetAmount = convertBaseAmountDecimal(baseAmount(maxAssetAmountBN, THORCHAIN_DECIMAL), assetBalance.decimal)

  return maxAssetAmount.amount().isGreaterThan(assetBalance.amount()) ? assetBalance : maxAssetAmount
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
