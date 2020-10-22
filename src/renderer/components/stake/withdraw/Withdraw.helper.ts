import { AssetAmount, baseAmount, baseToAsset, bn } from '@thorchain/asgardex-util'

import { getAssetShare, getRuneShare } from '../../../helpers/poolShareHelper'

export const getWithdrawAmountsFactory = (
  poolUnits?: string,
  totalRuneInPool?: string,
  totalAssetInPool?: string,
  stakeUnits?: string
) => {
  const units = { units: stakeUnits }

  const runeShare = getRuneShare(units, { runeDepth: totalRuneInPool, poolUnits }).amount()
  const assetShare = getAssetShare(units, { assetDepth: totalAssetInPool, poolUnits }).amount()

  return (percentAmount: number): { runeWithdraw: AssetAmount; assetWithdraw: AssetAmount } => {
    const percentBn = bn(percentAmount / 100)
    const runeBaseAmount = baseAmount(percentBn.multipliedBy(runeShare))
    const assetBaseAmount = baseAmount(percentBn.multipliedBy(assetShare))

    return {
      runeWithdraw: baseToAsset(runeBaseAmount),
      assetWithdraw: baseToAsset(assetBaseAmount)
    }
  }
}
