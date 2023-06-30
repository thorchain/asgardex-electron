import { PoolDetail } from '@xchainjs/xchain-midgard'
import { baseAmount, BaseAmount, bn, bnOrZero } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { ZERO_BN } from '../const'
import { convertBaseAmountDecimal, THORCHAIN_DECIMAL } from './assetHelper'

/**
 * RUNE share of a pool in `BaseAmount`
 */
export const getRuneShare = (liquidityUnits: BigNumber, pool: Pick<PoolDetail, 'runeDepth' | 'units'>): BaseAmount => {
  const runeDepth = bnOrZero(pool.runeDepth)
  // Default is 1 as neutral element for division
  const poolUnits = bn(pool.units || 1)

  // formula: liquidityUnits * runeDepth / poolUnits
  const runeShare = liquidityUnits
    .multipliedBy(runeDepth)
    .div(poolUnits)
    // don't use decimal for `BigNumber`s used in `BaseAmount`
    // and always round down for currencies
    .decimalPlaces(0, BigNumber.ROUND_DOWN)
  return baseAmount(runeShare, THORCHAIN_DECIMAL)
}

/**
 * Asset share of a pool
 *
 * Returned `BaseAmount` is based on given assetDecimal, which should be the "original" asset decimal
 */
export const getAssetShare = ({
  liquidityUnits,
  detail: { assetDepth, units: poolUnits },
  assetDecimal
}: {
  liquidityUnits: BigNumber
  detail: Pick<PoolDetail, 'assetDepth' | 'units'>
  assetDecimal: number
}): BaseAmount => {
  const assetDepthBN = bnOrZero(assetDepth)
  // Default is 1 as neutral element for division
  const poolUnitsBN = bn(poolUnits || 1)

  // formula: liquidityUnits * assetDepth / poolUnits
  const assetShareBN = liquidityUnits
    .multipliedBy(assetDepthBN)
    .div(poolUnitsBN)
    // don't use decimal for `BigNumber`s used in `BaseAmount`
    // and always round down for currencies
    .decimalPlaces(0, BigNumber.ROUND_DOWN)
  const assetShare1e8 = baseAmount(assetShareBN, THORCHAIN_DECIMAL)
  return convertBaseAmountDecimal(assetShare1e8, assetDecimal)
}

/**
 * Pool share in percent
 *
 * Note: The only reason ot use BigNumber here is for formatting it easily in UI
 */
export const getPoolShare = (liquidityUnits: BigNumber, { units: poolUnits }: Pick<PoolDetail, 'units'>): BigNumber =>
  poolUnits ? liquidityUnits.div(poolUnits).multipliedBy(100) : ZERO_BN
