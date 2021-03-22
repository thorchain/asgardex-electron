import { PoolData, getValueOfAsset1InAsset2, getValueOfRuneInAsset } from '@thorchain/asgardex-util'
import { bnOrZero, baseAmount, assetFromString, Asset, AssetRuneNative, assetToString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../../shared/api/types'
import { ONE_RUNE_BASE_AMOUNT } from '../../../shared/mock/amount'
import { ZERO_BASE_AMOUNT } from '../../const'
import { isChainAsset, isUSDAsset } from '../../helpers/assetHelper'
import { PoolDetail } from '../../services/midgard/types'
import { PoolFilter } from '../../services/midgard/types'
import { toPoolData } from '../../services/midgard/utils'
import { GetPoolsStatusEnum, Constants as ThorchainConstants, LastblockItem } from '../../types/generated/midgard'
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

      const poolPrice = getValueOfAsset1InAsset2(ONE_RUNE_BASE_AMOUNT, poolData, pricePoolData)

      const depthAmount = baseAmount(bnOrZero(poolDetail?.runeDepth))
      const depthPrice = getValueOfRuneInAsset(depthAmount, pricePoolData)

      const volumeAmount = baseAmount(bnOrZero(poolDetail.volume24h))
      const volumePrice = getValueOfRuneInAsset(volumeAmount, pricePoolData)

      /**
       * Mock it with fixed 0 as midgard v2 does not have data for it
       * target result: baseAmount(bnOrZero(poolDetail?.poolTxAverage))
       */
      const transaction = ZERO_BASE_AMOUNT
      const transactionPrice = getValueOfRuneInAsset(transaction, pricePoolData)

      const slip = bnOrZero(poolDetail?.poolSlipAverage).dividedBy(100)
      const trades = bnOrZero(poolDetail?.swappingTxCount)
      const status = stringToGetPoolsStatus(poolDetail?.status)

      const pool: Pool = {
        asset: AssetRuneNative,
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
        key: ticker,
        network
      }
    })
  )
}

export const getBlocksLeftForPendingPool = (
  constants: ThorchainConstants,
  lastblocks: LastblockItem[],
  asset: Asset
): O.Option<number> => {
  const newPoolCycle = constants?.int_64_values?.NewPoolCycle
  const lastHeight = Number(lastblocks.find((blockInfo) => blockInfo.chain === asset?.chain)?.thorchain)

  if (!newPoolCycle || !lastHeight) return O.none

  return O.some(newPoolCycle - (lastHeight % newPoolCycle))
}

export const getBlocksLeftForPendingPoolAsString = (
  constants: ThorchainConstants,
  lastblocks: LastblockItem[],
  stringAsset: Asset
): string => {
  return FP.pipe(
    getBlocksLeftForPendingPool(constants, lastblocks, stringAsset),
    O.fold(
      () => '',
      (blocksLeft) => blocksLeft.toString()
    )
  )
}

/**
 * Filters tableData array by passed active filter.
 * If oFilter is O.none will return tableData array without any changes
 */
export const filterTableData = (oFilter: O.Option<PoolFilter> = O.none) => (
  tableData: PoolTableRowData[]
): PoolTableRowData[] => {
  return FP.pipe(
    oFilter,
    O.map((filter) =>
      FP.pipe(
        tableData,
        A.filterMap((tableRow) => {
          if (filter === 'base') {
            return isChainAsset(tableRow.pool.target) ? O.some(tableRow) : O.none
          }
          if (filter === 'usd') {
            return isUSDAsset(tableRow.pool.target) ? O.some(tableRow) : O.none
          }
          const stringAsset = assetToString(tableRow.pool.target)
          return stringAsset.includes(filter) ? O.some(tableRow) : O.none
        })
      )
    ),
    O.getOrElse(() => tableData)
  )
}
