import { baseAmount, formatBaseAsTokenAmount } from '@thorchain/asgardex-token'
import { validBNOrZero, bn } from '@thorchain/asgardex-util'

import { PriceDataIndex } from '../../services/midgard/types'
import { getAssetFromString } from '../../services/midgard/utils'
import { PoolDetail, PoolDetailStatusEnum } from '../../types/generated/midgard'
import { PoolDataType } from './types'

export const getPoolData = (
  asset: string,
  poolDetail: PoolDetail,
  priceIndex: PriceDataIndex,
  basePriceAsset: string
): Omit<PoolDataType, 'deepest'> => {
  const { ticker: target = '' } = getAssetFromString(poolDetail?.asset)

  const runePrice = validBNOrZero(priceIndex?.RUNE)

  const poolPrice = validBNOrZero(priceIndex[target.toUpperCase()])
  const poolPriceString = `${basePriceAsset} ${poolPrice.toFixed(3)}`

  // formula: poolDetail.runeDepth * runePrice
  const depth = bn(poolDetail?.runeDepth ?? 0).multipliedBy(runePrice)
  const depthAsString = formatBaseAsTokenAmount(baseAmount(depth))
  // formula: poolDetail.poolVolume24hr * runePrice
  const volume = bn(poolDetail?.poolVolume24hr ?? 0).multipliedBy(runePrice)
  const volumeAsString = formatBaseAsTokenAmount(baseAmount(volume))
  // formula: poolDetail.poolTxAverage * runePrice
  const transaction = bn(poolDetail?.poolTxAverage ?? 0).multipliedBy(runePrice)
  const transactionAsString = formatBaseAsTokenAmount(baseAmount(transaction))
  const slip = bn(poolDetail?.poolSlipAverage ?? 0).multipliedBy(100)
  const slipAsString = slip.toString()
  const trade = bn(poolDetail?.swappingTxCount ?? 0)
  const tradeAsString = trade.toString()
  const status = poolDetail?.status ?? PoolDetailStatusEnum.Disabled

  return {
    pool: {
      asset,
      target
    },
    poolPrice: poolPriceString,
    depth: depthAsString,
    volume: volumeAsString,
    transaction: transactionAsString,
    slip: slipAsString,
    trade: tradeAsString,
    status,
    raw: {
      depth,
      volume,
      transaction,
      slip,
      trade,
      poolPrice
    }
  }
}
