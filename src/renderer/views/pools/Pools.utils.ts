import { getValueOfAsset1InAsset2, getValueOfRuneInAsset } from '@thorchain/asgardex-util'
import {
  bnOrZero,
  baseAmount,
  assetFromString,
  Asset,
  AssetRuneNative,
  assetToString,
  assetToBase,
  assetAmount,
  BaseAmount
} from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../../shared/api/types'
import { ONE_RUNE_BASE_AMOUNT } from '../../../shared/mock/amount'
import { ZERO_BASE_AMOUNT } from '../../const'
import {
  isBtcAsset,
  isChainAsset,
  isEthAsset,
  isUSDAsset,
  isEthTokenAsset,
  THORCHAIN_DECIMAL
} from '../../helpers/assetHelper'
import { eqString } from '../../helpers/fp/eq'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { PoolFilter } from '../../services/midgard/types'
import { toPoolData } from '../../services/midgard/utils'
import {
  GetPoolsStatusEnum,
  Constants as ThorchainConstants,
  PoolDetail,
  LastblockItem
} from '../../types/generated/midgard'
import { PoolTableRowData, Pool, PricePool } from './Pools.types'

const stringToGetPoolsStatus = (str: string): GetPoolsStatusEnum => {
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
  pricePool,
  network
}: {
  poolDetail: PoolDetail
  pricePool: PricePool
  network: Network
}): O.Option<PoolTableRowData> => {
  const oPoolDetailAsset = O.fromNullable(assetFromString(poolDetail.asset))

  return FP.pipe(
    oPoolDetailAsset,
    O.map((poolDetailAsset) => {
      const ticker = poolDetailAsset.ticker

      const isUSDPrice = isUSDAsset(pricePool.asset)
      const poolData = toPoolData(poolDetail)
      const pricePoolData = isUSDPrice ? poolDataFromUSDPrice(poolDetail) : pricePool.poolData

      const usdPrice = assetToBase(assetAmount(bnOrZero(poolDetail.assetPriceUSD), THORCHAIN_DECIMAL))
      const poolPrice = isUSDPrice ? usdPrice : getValueOfAsset1InAsset2(ONE_RUNE_BASE_AMOUNT, poolData, pricePoolData)

      // `depthAmount` is one side only, but we do need to show depth of both sides (asset + rune depth)
      const depthAmount = baseAmount(bnOrZero(poolDetail.runeDepth)).times(2)
      const depthPrice = getValueOfRuneInAsset(depthAmount, pricePoolData)

      const volumeAmount = baseAmount(bnOrZero(poolDetail.volume24h))
      const volumePrice = getValueOfRuneInAsset(volumeAmount, pricePoolData)

      /**
       * Mock it with fixed 0 as midgard v2 does not have data for it
       * target result: baseAmount(bnOrZero(poolDetail?.poolTxAverage))
       */
      const transaction = ZERO_BASE_AMOUNT
      const transactionPrice = getValueOfRuneInAsset(transaction, pricePoolData)

      const status = stringToGetPoolsStatus(poolDetail.status)

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
        status,
        key: ticker,
        network
      }
    })
  )
}

export const getBlocksLeftForPendingPool = (
  constants: ThorchainConstants,
  lastblocks: Array<Pick<LastblockItem, 'chain' | 'thorchain'>>,
  asset: Asset
): O.Option<number> => {
  const oNewPoolCycle: O.Option<number> = O.fromNullable(constants.int_64_values.PoolCycle)
  const oLastHeight = FP.pipe(
    lastblocks,
    A.findFirst((blockInfo) => eqString.equals(blockInfo.chain, asset.chain)),
    O.map(({ thorchain }) => thorchain)
  )

  return FP.pipe(
    sequenceTOption(oNewPoolCycle, oLastHeight),
    O.map(([newPoolCycle, lastHeight]) => newPoolCycle - (lastHeight % newPoolCycle))
  )
}

export const getBlocksLeftForPendingPoolAsString = (
  constants: ThorchainConstants,
  lastblocks: Array<Pick<LastblockItem, 'chain' | 'thorchain'>>,
  asset: Asset
): string => {
  return FP.pipe(
    getBlocksLeftForPendingPool(constants, lastblocks, asset),
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
export const filterTableData =
  (oFilter: O.Option<PoolFilter> = O.none) =>
  (tableData: PoolTableRowData[]): PoolTableRowData[] => {
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

/**
 * Helper to get min. amount for pool txs
 * We use these currently to make sure all fees are covered
 *
 * TODO (@asgdx-team) Remove min. amount if xchain-* gets fee rates from THORChain
 * @see: https://github.com/xchainjs/xchainjs-lib/issues/299
 */
export const minPoolTxAmountUSD = (asset: Asset): BaseAmount => {
  // BUSD has 8 decimal
  const value = (v: number) => assetToBase(assetAmount(v, 8))
  // BTC $200
  if (isBtcAsset(asset)) return value(200)
  // ETH $50
  else if (isEthAsset(asset)) return value(50)
  // ERC20 $100
  else if (isEthTokenAsset(asset)) return value(100)
  // anything else $10
  else return value(10)
}

export const poolDataFromUSDPrice = (detail: Pick<PoolDetail, 'assetDepth' | 'runeDepth' | 'assetPriceUSD'>) => {
  const poolData = toPoolData(detail)
  return {
    assetBalance: poolData.assetBalance.times(bnOrZero(detail.assetPriceUSD)),
    runeBalance: poolData.runeBalance
  }
}
