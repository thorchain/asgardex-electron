import { baseAmount, BaseAmount, bn, bnOrZero } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

import { ZERO_BN } from '../const'
import { PoolDetail, StakersAssetData } from '../types/generated/midgard/models'
import { THORCHAIN_DECIMAL } from './assetHelper'

/**
 * RUNE share of a pool in `BaseAmount`
 */
export const getRuneShare = (
  { units }: Pick<StakersAssetData, 'units'>,
  pool: Pick<PoolDetail, 'runeDepth' | 'poolUnits'>
): BaseAmount => {
  const runeDepth = bnOrZero(pool.runeDepth)
  const stakeUnits = bnOrZero(units)
  // Default is 1 as neutral element for division
  const poolUnits = bn(pool.poolUnits || 1)

  const runeShare = runeDepth.multipliedBy(stakeUnits).div(poolUnits)
  return baseAmount(runeShare, THORCHAIN_DECIMAL)
}

/**
 * Asset share of a pool in `BaseAmount`
 */
export const getAssetShare = (
  { units }: Pick<StakersAssetData, 'units'>,
  { assetDepth, poolUnits }: Pick<PoolDetail, 'assetDepth' | 'poolUnits'>
): BaseAmount => {
  const assetDepthBN = bnOrZero(assetDepth)
  const stakeUnitsBN = bnOrZero(units)
  // Default is 1 as neutral element for division
  const poolUnitsBN = bn(poolUnits || 1)

  const assetShare = assetDepthBN.multipliedBy(stakeUnitsBN).div(poolUnitsBN)
  return baseAmount(assetShare, THORCHAIN_DECIMAL)
}

// TODO (@Veado): Remove `getAssetSharePrice` - we have to calculate price in other way
// https://github.com/thorchain/asgardex-electron/issues/513
export const getAssetSharePrice = (assetShare: BigNumber, price: BigNumber, priceRatio: BigNumber): BaseAmount =>
  baseAmount(assetShare.multipliedBy(price).multipliedBy(priceRatio))

/**
 * Pool share in percent
 *
 * Note: The only reason ot use BigNumber here is for formatting it easily in UI
 */
export const getPoolShare = (
  { units }: Pick<StakersAssetData, 'units'>,
  { poolUnits }: Pick<PoolDetail, 'poolUnits'>
): BigNumber => (poolUnits ? bnOrZero(units).div(poolUnits).multipliedBy(100) : ZERO_BN)
