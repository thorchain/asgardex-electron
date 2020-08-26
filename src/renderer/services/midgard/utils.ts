import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, bnOrZero, baseAmount, PoolData, EMPTY_ASSET } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import { head } from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'

import { RUNE_PRICE_POOL, CURRENCY_WHEIGHTS } from '../../const'
import { isMiniToken } from '../../helpers/binanceHelper'
import { AssetDetail, PoolDetail } from '../../types/generated/midgard'
import { PricePoolAssets, PricePools, PricePoolAsset, PricePool, PoolAsset } from '../../views/pools/types'
import { AssetDetails, AssetDetailMap, PoolDetails, PoolsStateRD, SelectedPricePoolAsset } from './types'

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
    : pools.filter((detail) => whitelist.find((asset) => detail.asset && detail.asset === asset) !== undefined)

  const pricePools = poolDetails
    .map((detail: PoolDetail) => {
      // Since we have filtered pools based on whitelist before ^,
      // we can type asset as `PricePoolAsset` now
      const asset = (detail?.asset ?? '') as PricePoolAsset
      return {
        asset,
        poolData: toPoolData(detail)
      } as PricePool
    })
    // sort by weights (high weight wins)
    .sort((a, b) => CURRENCY_WHEIGHTS[b.asset] - CURRENCY_WHEIGHTS[a.asset])
  return [RUNE_PRICE_POOL, ...pricePools]
}

/**
 * Selector to get a `PricePool` from a list of `PricePools` by a given `PricePoolAsset`
 *
 * It will always return a `PricePool`:
 * - (1) `PricePool` from list of pools (if available)
 * - (2) OR TUSDB (if available in list of pools)
 * - (3) OR RUNE (if no other pool is available)
 */
export const pricePoolSelector = (pools: PricePools, oAsset: O.Option<PricePoolAsset>): PricePool =>
  FP.pipe(
    oAsset,
    // (1) Check if `PricePool` is available in `PricePools`
    O.mapNullable((asset) => pools.find((pool) => pool.asset === asset)),
    // (2) If (1) fails, check if TUSDB pool is available in `PricePools`
    O.fold(() => O.fromNullable(pools.find((pool) => pool.asset === PoolAsset.TUSDB)), O.some),
    // (3) If (2) failes, return RUNE pool, which is always first entry in pools list
    O.getOrElse(() => head(pools))
  )

/**
 * Similar to `pricePoolSelector`, but taking `PoolsStateRD` instead of `PoolsState`
 */
export const pricePoolSelectorFromRD = (poolsRD: PoolsStateRD, selectedPricePoolAsset: SelectedPricePoolAsset) => {
  const pools = RD.toNullable(poolsRD)
  const pricePools = pools && O.toNullable(pools.pricePools)
  return (pricePools && pricePoolSelector(pricePools, selectedPricePoolAsset)) || RUNE_PRICE_POOL
}

/**
 * Gets a `PoolDetail by given ticker
 * It returns `None` if no `PoolDetail` has been found
 */
export const getPoolDetail = (details: PoolDetails, ticker: string): O.Option<PoolDetail> =>
  FP.pipe(
    details.find((detail: PoolDetail) => {
      const { asset: detailAsset = '' } = detail
      const detailTicker = assetFromString(detailAsset)?.ticker
      return detailTicker && detailTicker === ticker
    }),
    O.fromNullable
  )

/**
 * Converts PoolDetails to the appropriate HashMap
 * Keys of the end HasMap is PoolDetails[i].asset
 */
export const getPoolDetailsHashMap = (poolDetails: PoolDetails): Record<string, PoolData> => {
  const res = poolDetails.reduce((acc, cur) => {
    if (!cur.asset) {
      return acc
    }

    return { ...acc, [cur.asset]: toPoolData(cur) }
  }, {} as Record<string, PoolData>)

  res[PoolAsset.RUNE67C] = {
    ...RUNE_PRICE_POOL.poolData
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
  return poolAssets.filter((poolAsset) => !isMiniToken(assetFromString(poolAsset) || EMPTY_ASSET))
}
