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
import { ONE_ASSET_BASE_AMOUNT } from '../../const'
import { getRuneAsset } from '../../helpers/assetHelper'
import { toPoolData } from '../../services/midgard/utils'
import {
  PoolDetail,
  GetPoolsStatusEnum
  /*ThorchainLastblock, ThorchainConstants */
} from '../../types/generated/midgard'
import { PoolTableRowData, Pool } from './Pools.types'

// eslint-disable-next-line
type ThorchainLastblock = any
// eslint-disable-next-line
type ThorchainConstants = any

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

      const volumeAmount = baseAmount(bnOrZero(/*poolDetail?.poolVolume24hr*/ 0))
      const volumePrice = getValueOfRuneInAsset(volumeAmount, pricePoolData)

      const transaction = baseAmount(bnOrZero(/*poolDetail?.poolTxAverage*/ 0))
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
  lastblock: ThorchainLastblock
): Option<number> => {
  const newPoolCycle = constants?.int_64_values?.NewPoolCycle
  const lastHeight = lastblock?.thorchain

  if (!newPoolCycle || !lastHeight) return none

  return some(newPoolCycle - (lastHeight % newPoolCycle))
}

export const getBlocksLeftForPendingPoolAsString = (
  constants: ThorchainConstants,
  lastblock: ThorchainLastblock
): string =>
  FP.pipe(
    getBlocksLeftForPendingPool(constants, lastblock),
    O.fold(
      () => '',
      (blocksLeft) => blocksLeft.toString()
    )
  )
