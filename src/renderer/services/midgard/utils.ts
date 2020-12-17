import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import { assetFromString, bnOrZero, baseAmount, Asset, assetToString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { head } from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'

import { CURRENCY_WHEIGHTS } from '../../const'
import { isBUSDAsset } from '../../helpers/assetHelper'
import { isMiniToken } from '../../helpers/binanceHelper'
import { eqAsset } from '../../helpers/fp/eq'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { PricePoolAssets, PricePools, PricePoolAsset, PricePool } from '../../views/pools/Pools.types'
import {
  AssetDetails,
  AssetDetailMap,
  PoolDetails,
  PoolsStateRD,
  SelectedPricePoolAsset,
  AssetDetail,
  PoolDetail
} from './types'

export const getAssetDetailIndex = (assets: AssetDetails): AssetDetailMap | {} => {
  let assetDataIndex = {}

  assets.forEach((assetInfo) => {
    const { asset = '' } = assetInfo
    const symbol = assetFromString(asset)?.symbol

    if (symbol) {
      assetDataIndex = { ...assetDataIndex, [symbol]: assetInfo }
    }
  })

  return assetDataIndex
}

export const getAssetDetail = (assets: AssetDetails, ticker: string): O.Option<AssetDetail> =>
  FP.pipe(
    assets.find((detail: AssetDetail) => {
      const { asset = '' } = detail
      const detailTicker = assetFromString(asset)?.ticker
      return detailTicker && detailTicker === ticker
    }),
    O.fromNullable
  )

export const getPricePools = (pools: PoolDetails, whitelist?: PricePoolAssets): PricePools => {
  const poolDetails = !whitelist
    ? pools
    : pools.filter((detail) => whitelist.find((asset) => detail?.asset === assetToString(asset)))

  const pricePools = poolDetails
    .map((detail: PoolDetail) => {
      // Since we have filtered pools based on whitelist before ^,
      // we can type asset as `PricePoolAsset` now
      const asset = assetFromString(detail?.asset ?? '') as PricePoolAsset
      return {
        asset,
        poolData: toPoolData(detail)
      } as PricePool
    })
    // sort by weights (high weight wins)
    .sort((a, b) => (CURRENCY_WHEIGHTS[assetToString(b.asset)] || 0) - (CURRENCY_WHEIGHTS[assetToString(a.asset)] || 0))
  return [RUNE_PRICE_POOL, ...pricePools]
}

/**
 * Selector to get a `PricePool` from a list of `PricePools` by a given `PricePoolAsset`
 *
 * It will always return a `PricePool`:
 * - (1) `PricePool` from list of pools (if available)
 * - (2) OR BUSDB (if available in list of pools)
 * - (3) OR RUNE (if no other pool is available)
 */
export const pricePoolSelector = (pools: PricePools, oAsset: O.Option<PricePoolAsset>): PricePool =>
  FP.pipe(
    oAsset,
    // (1) Check if `PricePool` is available in `PricePools`
    O.mapNullable((asset) => pools.find((pool) => eqAsset.equals(pool.asset, asset))),
    // (2) If (1) fails, check if BUSDB pool is available in `PricePools`
    O.fold(() => O.fromNullable(pools.find((pool) => isBUSDAsset(pool.asset))), O.some),
    // (3) If (2) failes, return RUNE pool, which is always first entry in pools list
    O.getOrElse(() => head(pools))
  )

/**
 * Similar to `pricePoolSelector`, but taking `PoolsStateRD` instead of `PoolsState`
 */
export const pricePoolSelectorFromRD = (
  poolsRD: PoolsStateRD,
  selectedPricePoolAsset: SelectedPricePoolAsset
): PricePool =>
  FP.pipe(
    RD.toOption(poolsRD),
    O.chain((pools) => pools.pricePools),
    O.map((pricePools) => pricePoolSelector(pricePools, selectedPricePoolAsset)),
    O.getOrElse(() => RUNE_PRICE_POOL)
  )

/**
 * Gets a `PoolDetail by given Asset
 * It returns `None` if no `PoolDetail` has been found
 */
export const getPoolDetail = (details: PoolDetails, asset: Asset): O.Option<PoolDetail> =>
  FP.pipe(
    details.find((detail: PoolDetail) => {
      const { asset: detailAsset = '' } = detail
      const detailTicker = assetFromString(detailAsset)
      return detailTicker && eqAsset.equals(detailTicker, asset)
    }),
    O.fromNullable
  )

/**
 * Converts PoolDetails to the appropriate HashMap
 * Keys of the end HasMap is PoolDetails[i].asset
 */
export const getPoolDetailsHashMap = (poolDetails: PoolDetails, runeAsset: Asset): Record<string, PoolData> => {
  const res = poolDetails.reduce((acc, cur) => {
    if (!cur.asset) {
      return acc
    }

    return { ...acc, [cur.asset]: toPoolData(cur) }
  }, {} as Record<string, PoolData>)

  const runePricePool = RUNE_PRICE_POOL

  res[assetToString(runeAsset)] = {
    ...runePricePool.poolData
  }

  return res
}

/**
 * Transforms `PoolDetail` into `PoolData` (provided by `asgardex-util`)
 */
export const toPoolData = (detail: PoolDetail): PoolData => ({
  assetBalance: baseAmount(bnOrZero(detail.assetDepth)),
  runeBalance: baseAmount(bnOrZero(detail.runeDepth))
})

/**
 * Filter out mini tokens from pool assets
 */
export const filterPoolAssets = (poolAssets: string[]) => {
  return poolAssets.filter((poolAsset) => !isMiniToken(assetFromString(poolAsset) || { symbol: '' }))
}
