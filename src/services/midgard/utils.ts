import * as RD from '@devexperts/remote-data-ts'
import { getAssetFromString } from '@thorchain/asgardex-util'
import { head } from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'

import { RUNE_PRICE_POOL, CURRENCY_WHEIGHTS } from '../../const'
import { toPoolData } from '../../helpers/poolHelper'
import { AssetDetail, PoolDetail } from '../../types/generated/midgard'
import { PricePoolAssets, PricePools, PricePoolAsset, PricePool, PoolAsset } from '../../views/pools/types'
import { AssetDetails, AssetDetailMap, PoolDetails, PoolsStateRD, SelectedPricePoolAsset } from './types'

export const getAssetDetailIndex = (assets: AssetDetails): AssetDetailMap | {} => {
  let assetDataIndex = {}

  assets.forEach((assetInfo) => {
    const { asset = '' } = assetInfo
    const { symbol = '' } = getAssetFromString(asset)

    if (symbol) {
      assetDataIndex = { ...assetDataIndex, [symbol]: assetInfo }
    }
  })

  return assetDataIndex
}

export const getAssetDetail = (assets: AssetDetails, ticker: string): O.Option<AssetDetail> =>
  assets.reduce((acc: O.Option<AssetDetail>, asset: AssetDetail) => {
    if (O.isNone(acc)) {
      const { asset: a = '' } = asset
      const { ticker: t } = getAssetFromString(a)
      return ticker === t ? O.some(asset) : O.none
    }
    return acc
  }, O.none)

export const getPricePools = (pools: PoolDetails, whitelist: PricePoolAssets): PricePools => {
  const poolDetails = pools.filter(
    (detail) => whitelist.find((asset) => detail.asset && detail.asset === asset) !== undefined
  )

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
 * Returns price pool depending on selected `PricePoolAsset`
 */
export const pricePoolSelector = (pools: PricePools, selectedAsset: O.Option<PricePoolAsset>) => {
  const asset = O.toNullable(selectedAsset)
  // Check if prev. selected pool is still available
  const prevPool = asset && pools.find((pool) => pool.asset === asset)
  if (prevPool) {
    return prevPool
  }

  // Use TUSDB or use "RUNE" pool (which is always the first pool")
  const tusdbPool = pools.find((pool) => pool.asset === PoolAsset.TUSDB)
  return tusdbPool || head(pools)
}

/**
 * Similar to `pricePoolSelector`, but taking `PoolsStateRD` instead of `PoolsState`
 */
export const pricePoolSelectorFromRD = (poolsRD: PoolsStateRD, selectedPricePoolAsset: SelectedPricePoolAsset) => {
  const pools = RD.toNullable(poolsRD)
  const pricePools = pools && O.toNullable(pools.pricePools)
  return (pricePools && pricePoolSelector(pricePools, selectedPricePoolAsset)) || RUNE_PRICE_POOL
}
