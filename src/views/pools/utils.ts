import {
  bnOrZero,
  PoolData,
  assetAmount,
  getValueOfAsset1InAsset2,
  // getValueOfRuneInAsset,
  baseAmount,
  baseToAsset,
  getValueOfRuneInAsset
} from '@thorchain/asgardex-util'

import { RUNE_TICKER } from '../../const'
import { toPoolData } from '../../helpers/poolHelper'
import { getAssetFromString } from '../../services/midgard/utils'
import { PoolDetail, PoolDetailStatusEnum } from '../../types/generated/midgard'
import { PoolTableRowData, Pool } from './types'

export const getPoolTableRowData = (poolDetail: PoolDetail, pricePoolData: PoolData): PoolTableRowData => {
  const { ticker = '' } = getAssetFromString(poolDetail?.asset)

  const poolData = toPoolData(poolDetail)

  const poolPrice = getValueOfAsset1InAsset2(assetAmount(1), poolData, pricePoolData)

  const depthAmount = baseAmount(bnOrZero(poolDetail?.runeDepth))
  const depthPrice = getValueOfRuneInAsset(baseToAsset(depthAmount), pricePoolData)

  const volumeAmount = baseAmount(bnOrZero(poolDetail?.poolVolume24hr))
  const volumePrice = getValueOfAsset1InAsset2(baseToAsset(volumeAmount), poolData, pricePoolData)

  const transaction = baseAmount(bnOrZero(poolDetail?.poolTxAverage))
  const transactionPrice = getValueOfAsset1InAsset2(baseToAsset(transaction), poolData, pricePoolData)

  const slip = bnOrZero(poolDetail?.poolSlipAverage).multipliedBy(100)
  const trades = bnOrZero(poolDetail?.swappingTxCount)
  const status = poolDetail?.status ?? PoolDetailStatusEnum.Disabled

  const pool: Pool = {
    asset: RUNE_TICKER,
    target: ticker
  }

  return {
    pool,
    poolPrice,
    depthPrice,
    volumePrice,
    transactionPrice,
    slip,
    trades,
    status,
    key: ticker
  }
}
