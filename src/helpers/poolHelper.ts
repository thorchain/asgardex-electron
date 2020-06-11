import { bnOrZero } from '@thorchain/asgardex-util'

import { BASE_TOKEN_TICKER } from '../const'
import { PoolsState, PoolDetails } from '../services/midgard/types'
import { getAssetFromString } from '../services/midgard/utils'
import { Nothing, Maybe } from '../types/asgardex.d'
import { PoolDetailStatusEnum, PoolDetail } from '../types/generated/midgard'
import { PoolRowType } from '../views/pools/types'
import { getPoolData } from '../views/pools/utils'

export const getPoolViewData = (
  pools: Pick<PoolsState, 'poolDetails' | 'priceIndex'>,
  poolStatus: PoolDetailStatusEnum
): PoolRowType[] => {
  const { poolDetails, priceIndex } = pools
  const deepestPool = getDeepestPool(poolDetails)
  const { symbol: deepestPoolSymbol } = getAssetFromString(deepestPool?.asset)
  // Transform `PoolDetails` -> PoolRowType
  const poolViewData = poolDetails.map((poolDetail, index) => {
    const { symbol = '' } = getAssetFromString(poolDetail.asset)
    const deepest = symbol && deepestPoolSymbol && symbol === deepestPoolSymbol
    return {
      ...getPoolData(symbol, poolDetail, priceIndex, BASE_TOKEN_TICKER),
      deepest,
      key: poolDetail?.asset || index
    } as PoolRowType
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
