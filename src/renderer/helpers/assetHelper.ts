import { Asset } from '@thorchain/asgardex-util'

export const RUNE_SYMBOL_MAINNET = 'RUNE-B1A'
export const RUNE_SYMBOL_TESTNET = 'RUNE-67C'
export const BNB_SYMBOL = 'BNB'

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
 * Check whether is RUNE asset or not
 */
export const isRuneAsset = ({ symbol }: Asset): boolean =>
  symbol === RUNE_SYMBOL_MAINNET || symbol === RUNE_SYMBOL_TESTNET

export const isBnbAsset = ({ symbol }: Asset): boolean => symbol === BNB_SYMBOL
