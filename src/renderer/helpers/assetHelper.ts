import { Asset } from '@thorchain/asgardex-util'

// Note: All of following content will be go into `@thorchain/asgardex-util`

export const RUNE_SYMBOL_MAINNET = 'RUNE-B1A'
export const RUNE_SYMBOL_TESTNET = 'RUNE-67C'
export const BNB_SYMBOL = 'BNB'

/**
 * Check whether is RUNE asset or not
 */
export const isRuneAsset = ({ symbol }: Asset): boolean =>
  symbol === RUNE_SYMBOL_MAINNET || symbol === RUNE_SYMBOL_TESTNET

export const isBnbAsset = ({ symbol }: Asset): boolean => symbol === BNB_SYMBOL
