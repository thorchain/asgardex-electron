import { AssetAmount, BaseAmount, baseAmount, baseToAsset, bn } from '@xchainjs/xchain-util'

export const getWithdrawAmounts = (
  runeShare: BaseAmount,
  assetShare: BaseAmount,
  percentAmount: number
): { rune: AssetAmount; asset: AssetAmount } => {
  const percentBn = bn(percentAmount / 100)
  const runeBaseAmount = baseAmount(percentBn.multipliedBy(runeShare.amount()))
  const assetBaseAmount = baseAmount(percentBn.multipliedBy(assetShare.amount()))

  return {
    rune: baseToAsset(runeBaseAmount),
    asset: baseToAsset(assetBaseAmount)
  }
}
