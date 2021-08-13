import { AssetAtom } from '@xchainjs/xchain-cosmos'
import {
  Asset,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetRuneNative,
  AssetLTC,
  Chain,
  isChain,
  AssetBCH,
  BCHChain,
  ETHChain,
  BNBChain,
  THORChain,
  BTCChain,
  CosmosChain,
  LTCChain,
  PolkadotChain
} from '@xchainjs/xchain-util'

import { ENABLED_CHAINS } from '../services/const'
import { ChainValues } from '../types/asgardex'
import { eqChain } from './fp/eq'

export const getChainAsset = (chain: Chain): Asset => {
  switch (chain) {
    case BNBChain:
      return AssetBNB
    case BTCChain:
      return AssetBTC
    case ETHChain:
      return AssetETH
    case THORChain:
      return AssetRuneNative
    case CosmosChain:
      return AssetAtom
    case BCHChain:
      return AssetBCH
    case LTCChain:
      return AssetLTC
    case PolkadotChain:
      throw Error('Polkadot is not supported yet')
  }
}

/**
 * Check whether chain is BTC chain
 */
export const isBtcChain = (chain: Chain): boolean => eqChain.equals(chain, BTCChain)

/**
 * Check whether chain is LTC chain
 */
export const isLtcChain = (chain: Chain): boolean => eqChain.equals(chain, LTCChain)

/**
 * Check whether chain is THOR chain
 */
export const isThorChain = (chain: Chain): boolean => eqChain.equals(chain, THORChain)

/**
 * Check whether chain is BNB chain
 */
export const isBnbChain = (chain: Chain): boolean => eqChain.equals(chain, BNBChain)

/**
 * Check whether chain is ETH chain
 */
export const isEthChain = (chain: Chain): boolean => eqChain.equals(chain, ETHChain)

/**
 * Check whether chain is BCH chain
 */
export const isBchChain = (chain: Chain): boolean => eqChain.equals(chain, BCHChain)

export const isEnabledChain = (chain: Chain) => ENABLED_CHAINS.includes(chain)

export const filterEnabledChains = <T>(values: ChainValues<T>): T[] => {
  const result: T[] = []
  Object.entries(values).forEach(([chain, value]) => {
    if (isChain(chain) && isEnabledChain(chain) && value) result.push(...value)
  })

  return result
}
