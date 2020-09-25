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
    basePriceAsset=""
    loading={true}
    runeStakedPrice={assetToBase(assetAmount(0))}
    runeStakedShare={assetToBase(assetAmount(0))}
  />
)

export const getRuneShare = (stake: StakersAssetData, pool: PoolDetail) => {
  const runeDepth = bnOrZero(pool.runeDepth)
  const stakeUnits = bnOrZero(stake.stakeUnits)
  /**
   * Default is 1 as neutral element for division
   */
  const poolUnits = bn(pool.poolUnits || 1)

  return runeDepth.multipliedBy(stakeUnits).div(poolUnits)
}

export const getAssetShare = (stake: StakersAssetData, pool: PoolDetail) => {
  const assetDepth = bnOrZero(pool.assetDepth)
  const stakeUnits = bnOrZero(stake.stakeUnits)
  const poolUnits = bn(pool.poolUnits || 1)

  return assetDepth.multipliedBy(stakeUnits).div(poolUnits)
}

export const getAssetSharePrice = (assetShare: BigNumber, price: BigNumber, priceRatio: BigNumber): BaseAmount => {
  return baseAmount(assetShare.multipliedBy(price).multipliedBy(priceRatio))
}

export const getPoolShare = ({ stakeUnits }: StakersAssetData, { poolUnits }: PoolDetail) => {
  return poolUnits ? bnOrZero(stakeUnits).div(poolUnits).multipliedBy(100) : ZERO_BN
}
