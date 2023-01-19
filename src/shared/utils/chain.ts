import { BNBChain } from '@xchainjs/xchain-binance'
import { BTCChain } from '@xchainjs/xchain-bitcoin'
import { BCHChain } from '@xchainjs/xchain-bitcoincash'
import { GAIAChain } from '@xchainjs/xchain-cosmos'
import { DOGEChain } from '@xchainjs/xchain-doge'
import { ETHChain } from '@xchainjs/xchain-ethereum'
import { LTCChain } from '@xchainjs/xchain-litecoin'
import { THORChain } from '@xchainjs/xchain-thorchain'
import { Chain } from '@xchainjs/xchain-util'

/**
 * All chains are currently supported by ASGDX
 * Whenever you want to support another chain, here is the first place to add it
 */
export const ENABLED_CHAINS = [
  BCHChain,
  BNBChain,
  BTCChain,
  GAIAChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  THORChain
] as const

export type EnabledChain = typeof ENABLED_CHAINS[number]

/**
 * Type guard
 * whether `Chain` is `EnableChain`
 */
export const isEnabledChain = (u: string): u is EnabledChain => ENABLED_CHAINS.includes(u as EnabledChain)

/**
 * Convert chain to string.
 *
 * @param {Chain} chain.
 * @returns {string} The string based on the given chain type.
 *
 * TODO (@veado) Return `Maybe<string>` instead of throwing an error
 */
export const chainToString = (chain: Chain): string => {
  if (!isEnabledChain(chain)) return `unknown chain ${chain}`

  switch (chain) {
    case BCHChain:
      return 'Bitcoin Cash'
    case BNBChain:
      return 'Binance Chain'
    case BTCChain:
      return 'Bitcoin'
    case GAIAChain:
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
