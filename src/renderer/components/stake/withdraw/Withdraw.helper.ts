import { AssetAmount, baseAmount, baseToAsset, bn } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

export const getWithdrawAmounts = (
  runeShare: BigNumber,
  assetShare: BigNumber,
  percentAmount: number
): { runeWithdraw: AssetAmount; assetWithdraw: AssetAmount } => {
  const percentBn = bn(percentAmount / 100)
  const runeBaseAmount = baseAmount(percentBn.multipliedBy(runeShare))
  const assetBaseAmount = baseAmount(percentBn.multipliedBy(assetShare))

  return {
    runeWithdraw: baseToAsset(runeBaseAmount),
    assetWithdraw: baseToAsset(assetBaseAmount)
  }
}
