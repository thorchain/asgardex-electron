import { BaseAmount, Asset, formatAssetAmountCurrency, baseToAsset } from '@thorchain/asgardex-util'

export const formatFee = ({ amount, asset }: { amount: BaseAmount; asset: Asset }) =>
  formatAssetAmountCurrency({
    amount: baseToAsset(amount),
    asset,
    trimZeros: true
  })
