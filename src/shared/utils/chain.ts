export const AvalancheChain = 'AVAX'
export const BCHChain = 'BCH'
export const BNBChain = 'BNB'
export const BTCChain = 'BTC'
export const CosmosChain = 'GAIA'
export const DOGEChain = 'DOGE'
export const ETHChain = 'ETH'
export const LTCChain = 'LTC'
export const THORChain = 'THOR'

const CHAINS = [
  AvalancheChain,
  BCHChain,
  BNBChain,
  BTCChain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  THORChain
] as const

export type Chain = typeof CHAINS[number]

/**
 * Type guard to check whether string  is based on type `Chain`
 * @param {string} c The chain string.
 * @returns {boolean} `true` or `false`
 */
export const isChain = (c: string): c is Chain => CHAINS.includes(c as Chain)

export const isEnabledChain = (chain: Chain) => chain.includes(chain)

/**
 * Convert chain to string.
 *
 * @param {Chain} chain.
 * @returns {string} The string based on the given chain type.
 */
export const chainToString = (chain: Chain): string => {
  switch (chain) {
    case AvalancheChain:
      return 'Avalance'
    case BCHChain:
      return 'Bitcoin Cash'
    case BNBChain:
      return 'Binance Chain'
    case BTCChain:
      return 'Bitcoin'
    case CosmosChain:
      return 'Cosmos'
    case DOGEChain:
      return 'Dogecoin'
    case ETHChain:
      return 'Ethereum'
    case LTCChain:
      return 'Litecoin'
    case THORChain:
      return 'THORChain'
  }
}
