import { bn } from '@thorchain/asgardex-util'

import { Asset, AssetDetails, AssetDetailMap, PriceDataIndex } from './types'

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

export const getPriceIndex = (assets: AssetDetails, baseTokenTicker: string): PriceDataIndex => {
  let baseTokenPrice = bn(0)

  if (baseTokenTicker.toLowerCase() === 'rune') {
    baseTokenPrice = bn(1)
  }

  const baseTokenInfo = assets.find((assetInfo) => {
    const { asset = '' } = assetInfo
    const { ticker } = getAssetFromString(asset)
    return ticker === baseTokenTicker.toUpperCase()
  })
  baseTokenPrice = bn(baseTokenInfo?.priceRune ?? 1)

  let priceDataIndex: PriceDataIndex = {
    // formula: 1 / baseTokenPrice
    RUNE: bn(1).div(baseTokenPrice)
  }

  assets.forEach((assetInfo) => {
    const { asset = '', priceRune } = assetInfo

    let price = bn(0)
    if (priceRune && baseTokenPrice) {
      // formula: 1 / baseTokenPrice) * priceRune
      price = bn(1).div(baseTokenPrice).multipliedBy(priceRune)
    }

    const { ticker } = getAssetFromString(asset)
    if (ticker) {
      priceDataIndex = { ...priceDataIndex, [ticker]: price }
    }
  })

  return priceDataIndex
}

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
  // We still use this function in plain JS world,
  // so we have to check the type of s here...
  if (s && typeof s === 'string') {
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
