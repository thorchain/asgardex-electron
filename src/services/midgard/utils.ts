import { getAssetFromString } from '@thorchain/asgardex-util'
import { head } from 'fp-ts/lib/NonEmptyArray'
import { Option, toNullable } from 'fp-ts/lib/Option'

import { RUNE_PRICE_POOL, CURRENCY_WHEIGHTS } from '../../const'
import { toPoolData } from '../../helpers/poolHelper'
import { Maybe, Nothing } from '../../types/asgardex'
import { AssetDetail, PoolDetail } from '../../types/generated/midgard'
import { PricePoolAssets, PricePools, PricePoolAsset, PricePool, PoolAsset } from '../../views/pools/types'
import { AssetDetails, AssetDetailMap, PoolDetails } from './types'

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

export const getAssetDetail = (assets: AssetDetails, ticker: string) =>
  assets.reduce((acc: Maybe<AssetDetail>, asset: AssetDetail) => {
    if (!acc) {
      const { asset: a = '' } = asset
      const { ticker: t } = getAssetFromString(a)
      return ticker === t ? asset : Nothing
    }
    return acc
  }, Nothing)

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

export const selectedPricePoolSelector = (pools: PricePools, oAsset: Option<PricePoolAsset>) => {
  const asset = toNullable(oAsset)
  // Check if prev. selected pool is still available
  const prevPool = asset && pools.find((pool) => pool.asset === asset)
  if (prevPool) {
    return prevPool
  }

  // Use TUSDB or use "RUNE" pool (which is always the first pool")
  const tusdbPool = pools.find((pool) => pool.asset === PoolAsset.TUSDB)
  return tusdbPool || head(pools)
}
