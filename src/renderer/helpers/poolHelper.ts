import { bnOrZero, PoolData, assetFromString } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as Eq from 'fp-ts/lib/Eq'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Ord from 'fp-ts/lib/Ord'

import { PoolDetails } from '../services/midgard/types'
import { PoolDetailStatusEnum, PoolDetail } from '../types/generated/midgard'
import { PoolTableRowData, PoolTableRowsData } from '../views/pools/types'
import { getPoolTableRowData } from '../views/pools/utils'
import { ordBaseAmount } from './fp/ord'
import { sequenceTOption } from './fpHelpers'

export const sortByDepth = (a: PoolTableRowData, b: PoolTableRowData) =>
  ordBaseAmount.compare(a.depthPrice, b.depthPrice)

const ordByDepth = Ord.ord.contramap(ordBaseAmount, ({ depthPrice }: PoolTableRowData) => depthPrice)

export const getPoolTableRowsData = (
  poolDetails: PoolDetails,
  pricePool: PoolData,
  poolStatus: PoolDetailStatusEnum
): PoolTableRowsData => {
  // filter pool details
  const filteredPoolDetails: PoolDetails = FP.pipe(
    poolDetails,
    A.filter((poolDetail) => poolDetail.status === poolStatus)
  )
  // get symbol of deepest pool
  const oDeepestPoolSymbol: O.Option<string> = FP.pipe(
    filteredPoolDetails,
    getDeepestPool,
    O.chain((poolDetail) => O.fromNullable(poolDetail.asset)),
    O.chain((assetString) => O.fromNullable(assetFromString(assetString))),
    O.map(({ symbol }) => symbol)
  )

  // Transform `PoolDetails` -> PoolRowType
  return FP.pipe(
    filteredPoolDetails,
    A.mapWithIndex<PoolDetail, PoolTableRowData>((index, poolDetail) => {
      // get symbol of PoolDetail
      const oPoolDetailSymbol: O.Option<string> = FP.pipe(
        O.fromNullable(assetFromString(poolDetail.asset ?? '')),
        O.map(({ symbol }) => symbol)
      )
      // compare symbols to set deepest pool
      const deepest = FP.pipe(
        sequenceTOption(oDeepestPoolSymbol, oPoolDetailSymbol),
        O.fold(
          () => false,
          ([deepestPoolSymbol, poolDetailSymbol]) => Eq.eqString.equals(deepestPoolSymbol, poolDetailSymbol)
        )
      )
      return {
        ...getPoolTableRowData(poolDetail, pricePool),
        key: poolDetail?.asset || index.toString(),
        deepest
      }
    }),
    // Table does not accept `defaultSortOrder` for depth  for any reason,
    // that's why we sort depth here
    A.sortBy([ordByDepth]),
    // descending sort
    A.reverse
  )
}

export const filterPendingPools = (pools: PoolDetails) =>
  pools.filter((pool: PoolDetail) => pool.status === PoolDetailStatusEnum.Bootstrapped)

export const hasPendingPools = (pools: PoolDetails) => filterPendingPools(pools).length > 0

/**
 * Filters a pool out with hightest value of run
 */
export const getDeepestPool = (pools: PoolDetails): O.Option<PoolDetail> =>
  pools.reduce((acc: O.Option<PoolDetail>, pool: PoolDetail) => {
    const runeDepth = bnOrZero(pool.runeDepth)
    const prev = O.toNullable(acc)
    return runeDepth.isGreaterThanOrEqualTo(bnOrZero(prev?.runeDepth)) ? O.some(pool) : acc
  }, O.none)
