import { bnOrZero, baseToAsset, baseAmount, PoolData } from '@thorchain/asgardex-util'

import { PoolDetails } from '../services/midgard/types'
import { getAssetFromString } from '../services/midgard/utils'
import { Nothing, Maybe } from '../types/asgardex.d'
import { PoolDetailStatusEnum, PoolDetail } from '../types/generated/midgard'
import { PoolTableRowData, PoolTableRowsData } from '../views/pools/types'
import { getPoolTableRowData } from '../views/pools/utils'

export const getPoolTableRowsData = (
  poolDetails: PoolDetails,
  pricePool: PoolData,
  poolStatus: PoolDetailStatusEnum
): PoolTableRowsData => {
  const deepestPool = getDeepestPool(poolDetails)
  const { symbol: deepestPoolSymbol } = getAssetFromString(deepestPool?.asset)
  // Transform `PoolDetails` -> PoolRowType
  const poolViewData = poolDetails.map((poolDetail, index) => {
    const { symbol = '' } = getAssetFromString(poolDetail.asset)
    const deepest = symbol && deepestPoolSymbol && symbol === deepestPoolSymbol
    return {
      ...getPoolTableRowData(poolDetail, pricePool),
      deepest,
      key: poolDetail?.asset || index
    } as PoolTableRowData
  })
  return poolViewData.filter((poolData) => poolData.status === poolStatus)
}

export const filterPendingPools = (pools: PoolDetails) =>
  pools.filter((pool: PoolDetail) => pool.status === PoolDetailStatusEnum.Bootstrapped)

export const hasPendingPools = (pools: PoolDetails) => filterPendingPools(pools).length > 0

/**
 * Filters a pool out with hightest value of run
 */
export const getDeepestPool = (pools: PoolDetails) =>
  pools.reduce((acc: Maybe<PoolDetail>, pool: PoolDetail) => {
    const runeDepth = bnOrZero(pool.runeDepth)
    return runeDepth.isGreaterThanOrEqualTo(bnOrZero(acc?.runeDepth)) ? pool : acc
  }, Nothing)

/**
 * Transforms `PoolDetail` into `PoolData`
 * Needed for misc. pool calculations using `asgardex-util`
 */
export const toPoolData = (detail: PoolDetail) => {
  const assetDepth = bnOrZero(detail.assetDepth)
  const runeDepth = bnOrZero(detail.runeDepth)
  return {
    assetBalance: baseToAsset(baseAmount(assetDepth)),
    runeBalance: baseToAsset(baseAmount(runeDepth))
  } as PoolData
}
