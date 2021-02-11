import { BaseAmount, baseAmount, bn } from '@xchainjs/xchain-util'

export const getWithdrawAmounts = (
  runeShare: BaseAmount,
  assetShare: BaseAmount,
  percentAmount: number
): { rune: BaseAmount; asset: BaseAmount } => {
  const percentBn = bn(percentAmount / 100)
  const rune = baseAmount(percentBn.multipliedBy(runeShare.amount()))
  const asset = baseAmount(percentBn.multipliedBy(assetShare.amount()))

  return {
    rune,
    asset
  }
}

// TODO (@Veado) Add test
export const getAsymWithdrawAmount = (share: BaseAmount, percentAmount: number): BaseAmount => {
  const percentBn = bn(percentAmount / 100)
  return baseAmount(percentBn.multipliedBy(share.amount()))
}
