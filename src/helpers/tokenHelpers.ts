import { Asset } from '../types/midgard'

export const shortSymbol = (symbol: string) => {
  return symbol?.split('-')[0].substr(0, 4)
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
 * */
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
