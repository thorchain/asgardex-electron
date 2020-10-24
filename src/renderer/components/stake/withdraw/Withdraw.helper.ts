import { AssetAmount, BaseAmount, baseAmount, baseToAsset, bn } from '@thorchain/asgardex-util'

export const getWithdrawAmounts = (
  runeShare: BaseAmount,
  assetShare: BaseAmount,
  percentAmount: number
): { runeWithdraw: AssetAmount; assetWithdraw: AssetAmount } => {
  const percentBn = bn(percentAmount / 100)
  const runeBaseAmount = baseAmount(percentBn.multipliedBy(runeShare.amount()))
  const assetBaseAmount = baseAmount(percentBn.multipliedBy(assetShare.amount()))

  return {
    runeWithdraw: baseToAsset(runeBaseAmount),
    assetWithdraw: baseToAsset(assetBaseAmount)
  }
}
