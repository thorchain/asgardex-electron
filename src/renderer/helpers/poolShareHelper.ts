import { baseAmount, BaseAmount, bn, bnOrZero } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { ZERO_BN } from '../const'
import { PoolDetail } from '../services/midgard/types'
import { THORCHAIN_DECIMAL } from './assetHelper'

/**
 * RUNE share of a pool in `BaseAmount`
 */
export const getRuneShare = (liquidityUnits: BaseAmount, pool: Pick<PoolDetail, 'runeDepth' | 'units'>): BaseAmount => {
  const runeDepth = bnOrZero(pool.runeDepth)
  // Default is 1 as neutral element for division
  const poolUnits = bn(pool.units || 1)

  const runeShare = runeDepth.multipliedBy(liquidityUnits.amount()).div(poolUnits)
  return baseAmount(runeShare, THORCHAIN_DECIMAL)
}

/**
 * Asset share of a pool in `BaseAmount`
 */
export const getAssetShare = (
  liquidityUnits: BaseAmount,
  { assetDepth, units: poolUnits }: Pick<PoolDetail, 'assetDepth' | 'units'>
): BaseAmount => {
  const assetDepthBN = bnOrZero(assetDepth)
  // Default is 1 as neutral element for division
  const poolUnitsBN = bn(poolUnits || 1)

  const assetShare = assetDepthBN.multipliedBy(liquidityUnits.amount()).div(poolUnitsBN)
  return baseAmount(assetShare, THORCHAIN_DECIMAL)
}

/**
 * Pool share in percent
 *
 * Note: The only reason ot use BigNumber here is for formatting it easily in UI
 */
export const getPoolShare = (liquidityUnits: BaseAmount, { units: poolUnits }: Pick<PoolDetail, 'units'>): BigNumber =>
  poolUnits ? liquidityUnits.amount().div(poolUnits).multipliedBy(100) : ZERO_BN
