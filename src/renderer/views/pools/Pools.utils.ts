import { PoolData, getValueOfAsset1InAsset2, getValueOfRuneInAsset } from '@thorchain/asgardex-util'
import {
  baseAmount,
  assetFromString,
  Asset,
  AssetRuneNative,
  assetToBase,
  assetAmount,
  BaseAmount,
  bnOrZero,
  assetToString
} from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../../shared/api/types'
import { ONE_RUNE_BASE_AMOUNT } from '../../../shared/mock/amount'
import { isBtcAsset, isChainAsset, isEthAsset, isUSDAsset, isEthTokenAsset } from '../../helpers/assetHelper'
import { isBnbChain, isEthChain } from '../../helpers/chainHelper'
import { eqString } from '../../helpers/fp/eq'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { PoolFilter } from '../../services/midgard/types'
import { toPoolData } from '../../services/midgard/utils'
import { GetPoolsStatusEnum, PoolDetail, LastblockItem } from '../../types/generated/midgard'
import { PoolTableRowData, Pool } from './Pools.types'

export const stringToGetPoolsStatus = (status: string): GetPoolsStatusEnum => {
  switch (status) {
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
  const oPoolDetailAsset = O.fromNullable(assetFromString(poolDetail.asset))

  return FP.pipe(
    oPoolDetailAsset,
    O.map((poolDetailAsset) => {
      const poolData = toPoolData(poolDetail)
      // convert string -> BN -> number - just for convenience
      const apy = bnOrZero(poolDetail.poolAPY).multipliedBy(100).decimalPlaces(2).toNumber()

      const poolPrice = getValueOfAsset1InAsset2(ONE_RUNE_BASE_AMOUNT, poolData, pricePoolData)

      // `depthAmount` is one side only, but we do need to show depth of both sides (asset + rune depth)
      const depthAmount = baseAmount(poolDetail.runeDepth).times(2)
      const depthPrice = getValueOfRuneInAsset(depthAmount, pricePoolData)

      const volumeAmount = baseAmount(poolDetail.volume24h)
      const volumePrice = getValueOfRuneInAsset(volumeAmount, pricePoolData)

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
        status,
        key: poolDetailAsset.ticker,
        network,
        apy
      }
    })
  )
}

export const getBlocksLeftForPendingPool = (
  lastblocks: Array<Pick<LastblockItem, 'chain' | 'thorchain'>>,
  asset: Asset,
  oNewPoolCycle: O.Option<number>
): O.Option<number> => {
  const oLastHeight = FP.pipe(
    lastblocks,
    A.findFirst((blockInfo) => eqString.equals(blockInfo.chain, asset.chain)),
    O.map(({ thorchain }) => Number(thorchain))
  )

  return FP.pipe(
    sequenceTOption(oNewPoolCycle, oLastHeight),
    O.map(([newPoolCycle, lastHeight]) => newPoolCycle - (lastHeight % newPoolCycle))
  )
}

export const getBlocksLeftForPendingPoolAsString = (
  lastblocks: Array<Pick<LastblockItem, 'chain' | 'thorchain'>>,
  asset: Asset,
  poolCycle: O.Option<number>
): string => {
  return FP.pipe(
    getBlocksLeftForPendingPool(lastblocks, asset, poolCycle),
    O.fold(
      () => '',
      (blocksLeft) => blocksLeft.toString()
    )
  )
}

export type FilterTableData = Pick<PoolTableRowData, 'pool'>
/**
 * Filters tableData array by passed active filter.
 * If oFilter is O.none will return tableData array without any changes
 */
export const filterTableData =
  (oFilter: O.Option<PoolFilter> = O.none) =>
  (tableData: FilterTableData[]): FilterTableData[] => {
    return FP.pipe(
      oFilter,
      O.map((filter) =>
        FP.pipe(
          tableData,
          A.filterMap((tableRow) => {
            const asset = tableRow.pool.target
            // all base chain assets
            if (filter === 'base') {
              return isChainAsset(asset) ? O.some(tableRow) : O.none
            }
            // usd assets
            if (filter === 'usd') {
              return isUSDAsset(asset) ? O.some(tableRow) : O.none
            }
            // erc20
            if (filter === 'erc20') {
              return isEthChain(asset.chain) && !isChainAsset(asset) ? O.some(tableRow) : O.none
            }
            // bep2
            if (filter === 'bep2') {
              return isBnbChain(asset.chain) && !isChainAsset(asset) ? O.some(tableRow) : O.none
            }
            // custom
            if (filter.length > 0) {
              return assetToString(asset).toLowerCase().includes(filter.toLowerCase()) ? O.some(tableRow) : O.none
            }

            return O.none
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

export const isEmptyPool = ({ assetDepth, runeDepth }: Pick<PoolDetail, 'assetDepth' | 'runeDepth'>): boolean =>
  bnOrZero(assetDepth).isZero() || bnOrZero(runeDepth).isZero()
