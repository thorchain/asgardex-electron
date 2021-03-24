import { BaseAmount, Asset, formatAssetAmountCurrency, baseToAsset } from '@xchainjs/xchain-util'

import { getTwoSigfigAssetAmount } from '../../../helpers/assetHelper'

export const formatFee = ({ amount, asset }: { amount: BaseAmount; asset: Asset }) =>
  formatAssetAmountCurrency({
    amount: getTwoSigfigAssetAmount(baseToAsset(amount)),
    asset,
    trimZeros: true
  })
