import { BASE_TOKEN_TICKER } from '../const'
import { PoolsState } from '../services/midgard/types'
import { getAssetFromString } from '../services/midgard/utils'
import { PoolDetailStatusEnum } from '../types/generated/midgard'
import { PoolRowType } from '../views/pools/types'
import { getPoolData } from '../views/pools/utils'

export const getPoolViewData = (pools: PoolsState, poolStatus: PoolDetailStatusEnum): PoolRowType[] => {
  const { poolDetails, priceIndex } = pools

  const poolViewData = Object.keys(poolDetails).map((poolName: string) => {
    const poolData = poolDetails[poolName]
    const { symbol = '' } = getAssetFromString(poolName)

    return { ...getPoolData(symbol, poolData, priceIndex, BASE_TOKEN_TICKER), key: poolName }
  })

  return poolViewData.filter((poolData) => poolData.status === poolStatus)
}
