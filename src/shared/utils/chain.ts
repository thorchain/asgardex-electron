export enum Chain {
  Binance = 'BNB',
  Bitcoin = 'BTC',
  Ethereum = 'ETH',
  THORChain = 'THOR',
  Cosmos = 'GAIA',
  BitcoinCash = 'BCH',
  Litecoin = 'LTC',
  Doge = 'DOGE',
  Avalanche = 'AVAX'
}

export const BNBChain = Chain.Binance
export const BTCChain = Chain.Bitcoin
export const ETHChain = Chain.Ethereum
export const THORChain = Chain.THORChain
export const CosmosChain = Chain.Cosmos
export const BCHChain = Chain.BitcoinCash
export const LTCChain = Chain.Litecoin
export const DOGEChain = Chain.Doge
export const AvalancheChain = Chain.Avalanche

/**
 * Type guard to check whether string  is based on type `Chain`
 *
 * @param {string} c The chain string.
 * @returns {boolean} `true` or `false`
 */
export const isChain = (c: string): c is Chain => (Object.values(Chain) as string[]).includes(c)

export const isEnabledChain = (chain: Chain) => chain.includes(chain)

/**
 * Convert chain to string.
 *
 * @param {Chain} chainId.
 * @returns {string} The string based on the given chain type.
 */
export const chainToString: ((chainId: Chain) => string) & Record<Chain, string> = Object.assign(
  (chainId: Chain) => {
    if (!(chainId in chainToString)) return 'unknown chain'
    return chainToString[chainId]
  },
  {
    [Chain.Avalanche]: 'Avalanche',
    [Chain.THORChain]: 'THORChain',
    [Chain.Bitcoin]: 'Bitcoin',
    [Chain.BitcoinCash]: 'Bitcoin Cash',
    [Chain.Litecoin]: 'Litecoin',
    [Chain.Ethereum]: 'Ethereum',
    [Chain.Binance]: 'Binance Chain',
    [Chain.Cosmos]: 'Cosmos',
    [Chain.Doge]: 'Dogecoin'
  }
)
