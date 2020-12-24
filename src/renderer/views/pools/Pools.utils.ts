import { PoolData, getValueOfAsset1InAsset2, getValueOfRuneInAsset } from '@thorchain/asgardex-util'
import { bnOrZero, baseAmount, assetFromString, Asset, AssetRuneNative } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'

import { ONE_ASSET_BASE_AMOUNT, ZERO_BASE_AMOUNT } from '../../const'
import { PoolDetail } from '../../services/midgard/types'
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
  pricePoolData
}: {
  poolDetail: PoolDetail
  pricePoolData: PoolData
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
       * Mock it with fixed 0 as midgard v2 does not have data for it
       * target result: baseAmount(bnOrZero(poolDetail?.poolTxAverage))
       */
      const transaction = ZERO_BASE_AMOUNT
      const transactionPrice = getValueOfRuneInAsset(transaction, pricePoolData)

      const slip = bnOrZero(poolDetail?.poolSlipAverage).multipliedBy(100)
      const trades = bnOrZero(poolDetail?.swappingTxCount)
      const status = stringToGetPoolsStatus(poolDetail?.status)

      const pool: Pool = {
        // As long as we don't have Native RUNE, its an RUNE asset of BNB chain
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
        key: ticker
      }
    })
  )
}

export const getBlocksLeftForPendingPool = (
  constants: ThorchainConstants,
  lastblocks: LastblockItem[],
  asset: Asset
): Option<number> => {
  const newPoolCycle = constants?.int_64_values?.NewPoolCycle
  const lastHeight = Number(lastblocks.find((blockInfo) => blockInfo.chain === asset?.chain)?.thorchain)

  if (!newPoolCycle || !lastHeight) return none

  return some(newPoolCycle - (lastHeight % newPoolCycle))
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
