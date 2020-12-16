import {
  bnOrZero,
  PoolData,
  getValueOfAsset1InAsset2,
  baseAmount,
  getValueOfRuneInAsset,
  assetFromString
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'

import { Network } from '../../../shared/api/types'
import { ONE_ASSET_BASE_AMOUNT, ZERO_BASE_AMOUNT } from '../../const'
import { getRuneAsset } from '../../helpers/assetHelper'
import { toPoolData } from '../../services/midgard/utils'
import {
  PoolDetail,
  GetPoolsStatusEnum,
  ConstantsSchema as ThorchainConstants,
  LastblockItem
} from '../../types/generated/midgard'
import { PoolTableRowData, Pool } from './Pools.types'

const stringToGetPoolsStatus = (str?: string): GetPoolsStatusEnum => {
  switch (str) {
    case GetPoolsStatusEnum.Suspended: {
      return GetPoolsStatusEnum.Suspended
    }
    case GetPoolsStatusEnum.Available:
      return GetPoolsStatusEnum.Available
    case GetPoolsStatusEnum.Staged:
      return GetPoolsStatusEnum.Staged
    default:
      return GetPoolsStatusEnum.Suspended
  }
}

export const getPoolTableRowData = ({
  poolDetail,
  pricePoolData,
  network
}: {
  poolDetail: PoolDetail
  pricePoolData: PoolData
  network: Network
}): O.Option<PoolTableRowData> => {
  const assetString = poolDetail?.asset ?? ''
  const oPoolDetailAsset = O.fromNullable(assetFromString(assetString))

  return FP.pipe(
    oPoolDetailAsset,
    O.map((poolDetailAsset) => {
      const ticker = poolDetailAsset.ticker

      const poolData = toPoolData(poolDetail)

      const poolPrice = getValueOfAsset1InAsset2(ONE_ASSET_BASE_AMOUNT, poolData, pricePoolData)

      const depthAmount = baseAmount(bnOrZero(poolDetail?.runeDepth))
      const depthPrice = getValueOfRuneInAsset(depthAmount, pricePoolData)

      const volumeAmount = baseAmount(bnOrZero(poolDetail.volume24h))
      const volumePrice = getValueOfRuneInAsset(volumeAmount, pricePoolData)

      /**
       * Mock it with fixed 0 as midgard v2 doe not have data for it
       * target result: baseAmount(bnOrZero(poolDetail?.poolTxAverage))
       */
      const transaction = ZERO_BASE_AMOUNT
      const transactionPrice = getValueOfRuneInAsset(transaction, pricePoolData)

      const slip = bnOrZero(/*poolDetail?.poolSlipAverage*/ 0).multipliedBy(100)
      const trades = bnOrZero(/*poolDetail?.swappingTxCount*/ 0)
      const status = stringToGetPoolsStatus(poolDetail?.status)

      const pool: Pool = {
        // As long as we don't have Native RUNE, its an RUNE asset of BNB chain
        asset: getRuneAsset({ network, chain: 'BNB' }),
        target: poolDetailAsset
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
    })
  )
}

export const getBlocksLeftForPendingPool = (
  constants: ThorchainConstants,
  lastblock: LastblockItem
): Option<number> => {
  const newPoolCycle = constants?.int_64_values?.NewPoolCycle
  const lastHeight = Number(lastblock?.thorchain)

  if (!newPoolCycle || !lastHeight) return none

  return some(newPoolCycle - (lastHeight % newPoolCycle))
}

export const getBlocksLeftForPendingPoolAsString = (constants: ThorchainConstants, lastblock: LastblockItem): string =>
  FP.pipe(
    getBlocksLeftForPendingPool(constants, lastblock),
    O.fold(
      () => '',
      (blocksLeft) => blocksLeft.toString()
    )
  )
