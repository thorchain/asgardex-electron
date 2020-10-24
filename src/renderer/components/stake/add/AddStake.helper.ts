import {
  Asset,
  baseAmount,
  BaseAmount,
  baseToAsset,
  formatAssetAmountCurrency,
  PoolData
} from '@thorchain/asgardex-util'

import { THORCHAIN_DECIMAL } from '../../../helpers/assetHelper'

export const maxRuneAmountToStake = ({
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

export const maxAssetAmountToStake = ({
  poolData,
  runeBalance,
  assetBalance
}: {
  poolData: PoolData
  runeBalance: BaseAmount
  assetBalance: BaseAmount
}): BaseAmount => {
  const { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance } = poolData
  const maxAssetAmount = poolAssetBalance
    .amount()
    .dividedBy(poolRuneBalance.amount())
    .multipliedBy(runeBalance.amount())
  return maxAssetAmount.isGreaterThan(assetBalance.amount()) ? assetBalance : baseAmount(maxAssetAmount)
}

export const getRuneAmountToStake = (
  assetAmount: BaseAmount,
  { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance }: PoolData
): BaseAmount =>
  baseAmount(
    // formula: assetAmount * poolRuneBalance / poolAssetBalance
    assetAmount.amount().times(poolRuneBalance.amount().dividedBy(poolAssetBalance.amount())),
    THORCHAIN_DECIMAL
  )

export const getAssetAmountToStake = (
  runeAmount: BaseAmount,
  { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance }: PoolData
): BaseAmount =>
  baseAmount(
    // formula: runeAmount * poolRuneBalance / poolAssetBalance
    runeAmount.amount().times(poolAssetBalance.amount().dividedBy(poolRuneBalance.amount())),
    THORCHAIN_DECIMAL
  )

export const formatFee = (fee: BaseAmount, asset: Asset) =>
  formatAssetAmountCurrency({
    amount: baseToAsset(fee),
    asset,
    trimZeros: true
  })
