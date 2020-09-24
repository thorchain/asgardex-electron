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
    assetEarnedAmount={assetToBase(assetAmount(0))}
    assetEarnedPrice={assetToBase(assetAmount(0))}
    assetStakedPrice={assetToBase(assetAmount(0))}
    assetStakedShare={assetToBase(assetAmount(0))}
    basePriceAsset=""
    loading={true}
    runeEarnedAmount={assetToBase(assetAmount(0))}
    runeEarnedPrice={assetToBase(assetAmount(0))}
    runeStakedPrice={assetToBase(assetAmount(0))}
    runeStakedShare={assetToBase(assetAmount(0))}
  />
)

export const getRuneShare = (stake: StakersAssetData, pool: PoolDetail) => {
  const runeDepth = bn(pool.runeDepth || 0)
  const stakeUnits = bn(stake.stakeUnits || 0)
  /**
   * Default is 1 as neutral element for division
   */
  const poolUnits = bn(pool.poolUnits || 1)

  return runeDepth.multipliedBy(stakeUnits).div(poolUnits)
}

export const getAssetShare = (stake: StakersAssetData, pool: PoolDetail) => {
  const assetDepth = bn(pool.assetDepth || 0)
  const stakeUnits = bn(stake.stakeUnits || 0)
  const poolUnits = bn(pool.poolUnits || 1)

  return assetDepth.multipliedBy(stakeUnits).div(poolUnits)
}

export const getAssetSharePrice = (assetShare: BigNumber, price: BigNumber, priceRatio: BigNumber): BaseAmount => {
  return baseAmount(assetShare.multipliedBy(price).multipliedBy(priceRatio))
}

export const getPoolShare = ({ stakeUnits }: StakersAssetData, { poolUnits }: PoolDetail) => {
  return poolUnits ? bnOrZero(stakeUnits).div(poolUnits).multipliedBy(100) : ZERO_BN
}
