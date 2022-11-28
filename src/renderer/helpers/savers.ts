import { getValueOfRuneInAsset, PoolData } from '@thorchain/asgardex-util'
import { assetFromString, baseAmount } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Ord from 'fp-ts/lib/Ord'

import { PoolsWatchList } from '../../shared/api/io'
import { Network } from '../../shared/api/types'
import type { PoolDetails } from '../services/midgard/types'
import { PoolDetail } from '../types/generated/midgard'
import type { SaversTableRowData, SaversTableRowsData } from '../views/savers/Savers.types'
import { eqAsset, eqString } from './fp/eq'
import { ordBaseAmount } from './fp/ord'
import { sequenceTOption, sequenceTOptionFromArray } from './fpHelpers'
import { getDeepestPoolSymbol } from './poolHelper'

// TODO(@veado) Depth price or Savers depth
const ordByDepth = Ord.Contravariant.contramap(ordBaseAmount, ({ depthPrice }: SaversTableRowData) => depthPrice)

export const getSaversTableRowData = ({
  poolDetail,
  pricePoolData,
  watchlist,
  network
}: {
  // TODO(@veado) Update Midgard types
  poolDetail: PoolDetail & { saversDepth?: string }
  pricePoolData: PoolData
  watchlist: PoolsWatchList
  network: Network
}): O.Option<SaversTableRowData> => {
  return FP.pipe(
    poolDetail.asset,
    assetFromString,
    O.fromNullable,
    O.map((poolDetailAsset) => {
      const depthAmount = baseAmount(poolDetail.saversDepth)
      const depthPrice = getValueOfRuneInAsset(depthAmount, pricePoolData)

      const watched: boolean = FP.pipe(
        watchlist,
        A.findFirst((poolInList) => eqAsset.equals(poolInList, poolDetailAsset)),
        O.isSome
      )

      return {
        asset: poolDetailAsset,
        depth: depthAmount,
        depthPrice,
        filled: 0, // TODO(@veado) Get dat from extra data
        count: 0, // TODO(@veado) Get dat from extra data
        key: poolDetailAsset.ticker,
        network,
        apr: 0, // get APR
        watched
      }
    })
  )
}

export const getSaversTableRowsData = ({
  poolDetails,
  pricePoolData,
  watchlist,
  network
}: {
  poolDetails: PoolDetails
  pricePoolData: PoolData
  watchlist: PoolsWatchList
  network: Network
}): SaversTableRowsData => {
  // get symbol of deepest pool
  const oDeepestPoolSymbol: O.Option<string> = getDeepestPoolSymbol(poolDetails)

  // Transform `PoolDetails` -> SaversTableRowData
  return FP.pipe(
    poolDetails,
    A.mapWithIndex<PoolDetail, O.Option<SaversTableRowData>>((index, poolDetail) => {
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
          ([deepestPoolSymbol, poolDetailSymbol]) => eqString.equals(deepestPoolSymbol, poolDetailSymbol)
        )
      )

      return FP.pipe(
        getSaversTableRowData({ poolDetail, pricePoolData, watchlist, network }),
        O.map(
          (poolTableRowData) =>
            ({
              ...poolTableRowData,
              key: poolDetail?.asset || index.toString(),
              deepest
            } as SaversTableRowData)
        )
      )
    }),
    sequenceTOptionFromArray,
    O.getOrElse(() => [] as SaversTableRowsData),
    // Table does not accept `defaultSortOrder` for depth  for any reason,
    // that's why we sort depth here
    A.sortBy([ordByDepth]),
    // descending sort
    A.reverse
  )
}
