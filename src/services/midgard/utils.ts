import { Maybe, Nothing } from '../../types/asgardex.d'
import { AssetDetail } from '../../types/generated/midgard'
import { Asset, AssetDetails, AssetDetailMap } from './types'

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

/**
 * Creates an `Asset` by a given string
 *
 * The string has following naming convention:
 * `AAA.BBB-CCC`
 * where
 * chain: `AAA`
 * ticker (optional): `BBB`
 * symbol: `BBB-CCC`
 * or
 * symbol: `CCC` (if no ticker available)
 *
 * Image: ^ https://files.slack.com/files-pri/TBFG8JBBQ-F0147D6PBJA/image.png
 *
 */
export const getAssetFromString = (s?: string): Asset => {
  let chain
  let symbol
  let ticker
  if (s) {
    const data = s.split('.')
    chain = data[0]
    const ss = data[1]
    if (ss) {
      symbol = ss
      // grab `ticker` from string or reference to `symbol` as `ticker`
      ticker = ss.split('-')[0]
    }
  }
  return { chain, symbol, ticker }
}
