import { Asset, AssetBNB, assetFromString, AssetRune67C, AssetRuneB1A } from '@thorchain/asgardex-util'

import { CURRENCY_SYMBOLS } from '../const'
import { Network } from '../services/app/types'

/**
 * Number of decimals for Binance chain assets
 * Example:
 * 1 RUNE == 100,000,000 ð (tor)
 * 0.00000001 RUNE == 1 ð (tor)
 * */
export const BNB_DECIMAL = 8

/**
 * 1 BTC == 100,000,000 satoshi
 * 0.00000001 BTC == 1 satoshi
 * */
export const BTC_DECIMAL = 8

/**
 * 1 ether == 1,000,000,000,000,000,000 wei (1e18)
 * 0.000000000000000001 ether == 1 wei
 * */
export const ETH_DECIMAL = 18

/**
 * Returns RUNE asset depending on network
 */
// TODO (@Veado) Add test
export const getRuneAsset = (net: Network) => (net === 'testnet' ? AssetRune67C : AssetRuneB1A)

/**
 * Check whether is RUNE asset or not
 */
export const isRuneAsset = ({ symbol }: Asset): boolean =>
  symbol === AssetRune67C.symbol || symbol === AssetRuneB1A.symbol

export const isBnbAsset = ({ symbol }: Asset): boolean => symbol === AssetBNB.symbol

export const getCurrencySymbolByAssetString = (asset: string) => {
  if (asset in CURRENCY_SYMBOLS) {
    return CURRENCY_SYMBOLS[asset as keyof typeof CURRENCY_SYMBOLS]
  }
  return assetFromString(asset)?.ticker || ''
}
