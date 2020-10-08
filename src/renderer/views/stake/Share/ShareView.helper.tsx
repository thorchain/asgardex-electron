import React from 'react'

import { assetAmount, assetToBase, baseAmount, BaseAmount, bn, bnOrZero } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

import PoolShare from '../../../components/uielements/poolShare'
import { ZERO_BN } from '../../../const'
import { PoolDetail, StakersAssetData } from '../../../types/generated/midgard/models'

export const renderPending = () => (
  <PoolShare
    source=""
    target=""
    poolShare={bn(0)}
    assetStakedPrice={assetToBase(assetAmount(0))}
    assetStakedShare={assetToBase(assetAmount(0))}
    basePriceSymbol=""
    loading={true}
    runeStakedPrice={assetToBase(assetAmount(0))}
    runeStakedShare={assetToBase(assetAmount(0))}
  />
)

export const getRuneShare = ({ units }: Pick<StakersAssetData, 'units'>, pool: PoolDetail) => {
  const runeDepth = bnOrZero(pool.runeDepth)
  const stakeUnits = bnOrZero(units)
  // Default is 1 as neutral element for division
  const poolUnits = bn(pool.poolUnits || 1)

  return runeDepth.multipliedBy(stakeUnits).div(poolUnits)
}

export const getAssetShare = (
  { units }: Pick<StakersAssetData, 'units'>,
  { assetDepth, poolUnits }: Pick<PoolDetail, 'assetDepth' | 'poolUnits'>
) => {
  const assetDepthBN = bnOrZero(assetDepth)
  const stakeUnitsBN = bnOrZero(units)
  // Default is 1 as neutral element for division
  const poolUnitsBN = bn(poolUnits || 1)

  return assetDepthBN.multipliedBy(stakeUnitsBN).div(poolUnitsBN)
}

export const getAssetSharePrice = (assetShare: BigNumber, price: BigNumber, priceRatio: BigNumber): BaseAmount =>
  baseAmount(assetShare.multipliedBy(price).multipliedBy(priceRatio))

export const getPoolShare = (
  { units }: Pick<StakersAssetData, 'units'>,
  { poolUnits }: Pick<PoolDetail, 'poolUnits'>
) => (poolUnits ? bnOrZero(units).div(poolUnits).multipliedBy(100) : ZERO_BN)
