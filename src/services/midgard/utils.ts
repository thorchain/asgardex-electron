import { getAssetFromString } from '@thorchain/asgardex-util'
import { Option, none, some, isNone } from 'fp-ts/lib/Option'

import { RUNE_PRICE_POOL, CURRENCY_WHEIGHTS } from '../../const'
import { toPoolData } from '../../helpers/poolHelper'
import { AssetDetail, PoolDetail } from '../../types/generated/midgard'
import { PricePoolAssets, PricePools, PricePoolAsset, PricePool } from '../../views/pools/types'
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

export const getAssetDetail = (assets: AssetDetails, ticker: string): Option<AssetDetail> =>
  assets.reduce((acc: Option<AssetDetail>, asset: AssetDetail) => {
    if (isNone(acc)) {
      const { asset: a = '' } = asset
      const { ticker: t } = getAssetFromString(a)
      return ticker === t ? some(asset) : none
    }
    return acc
  }, none)

export const getPricePools = (pools: PoolDetails, whitelist: PricePoolAssets): PricePools => {
  const pricePools = pools.filter(
    (detail) => whitelist.find((asset) => detail.asset && detail.asset === asset) !== undefined
  )
  return (
    pricePools
      .map((detail: PoolDetail) => {
        // Since we have filtered pools based on whitelist before ^,
        // we can type asset as `PricePoolAsset` now
        const asset = (detail?.asset ?? '') as PricePoolAsset
        return {
          asset,
          poolData: toPoolData(detail)
        } as PricePool
      })
      // add RUNE pool
      .concat([RUNE_PRICE_POOL])
      // sort by weights (high weight wins)
      .sort((a, b) => CURRENCY_WHEIGHTS[b.asset] - CURRENCY_WHEIGHTS[a.asset])
  )
}
