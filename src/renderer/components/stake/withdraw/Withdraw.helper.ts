import { AssetAmount, baseAmount, baseToAsset, bn, bnOrZero } from '@thorchain/asgardex-util'

import { PoolDetail, StakersAssetData } from '../../../types/generated/midgard/models'

export const getWithdrawAmountsFactory = (poolDetail: PoolDetail, stakersAssetData: StakersAssetData) => {
  const poolUnits = poolDetail.poolUnits
  const totalRuneInPool = bnOrZero(poolDetail.runeDepth)
  const totalAssetInPool = bnOrZero(poolDetail.assetDepth)

  const { units: stakeUnits } = stakersAssetData

  const stakeUnitsBN = bnOrZero(stakeUnits)

  const runeShare = poolUnits ? totalRuneInPool.multipliedBy(stakeUnitsBN).div(poolUnits) : bn(0)
  const assetShare = poolUnits ? totalAssetInPool.multipliedBy(stakeUnitsBN).div(poolUnits) : bn(0)

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
