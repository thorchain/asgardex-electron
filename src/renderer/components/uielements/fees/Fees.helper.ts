import { BaseAmount, Asset, formatAssetAmountCurrency, baseToAsset } from '@xchainjs/xchain-util'

export const formatFee = ({ amount, asset }: { amount: BaseAmount; asset: Asset }) =>
  formatAssetAmountCurrency({
    amount: baseToAsset(amount),
    asset,
    trimZeros: true
  })
