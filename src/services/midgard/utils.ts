import { getAssetFromString } from '@thorchain/asgardex-util'

import { Maybe, Nothing } from '../../types/asgardex.d'
import { AssetDetail } from '../../types/generated/midgard'
import { AssetDetails, AssetDetailMap } from './types'

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
