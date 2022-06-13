import { AssetLUNA } from '@xchainjs/xchain-terra'
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
  PolkadotChain,
  DOGEChain,
  AssetDOGE,
  TerraChain
} from '@xchainjs/xchain-util'

import { ENABLED_CHAINS } from '../services/const'
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
      throw Error('Cosmos is not supported yet')
    case BCHChain:
      return AssetBCH
    case LTCChain:
      return AssetLTC
    case DOGEChain:
      return AssetDOGE
    case TerraChain:
      return AssetLUNA
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

/**
 * Check whether chain is DOGE chain
 */
export const isDogeChain = (chain: Chain): boolean => eqChain.equals(chain, DOGEChain)

/**
 * Check whether chain is TERRA chain
 */
export const isTerraChain = (chain: Chain): boolean => eqChain.equals(chain, TerraChain)

/**
 * Check whether chain is Cosmos (GAIA) chain
 */
export const isCosmosChain = (chain: Chain): boolean => eqChain.equals(chain, CosmosChain)

export const isEnabledChain = (chain: Chain) => ENABLED_CHAINS.includes(chain)

type ChainValues<T> = {
  [k in Chain]?: T[]
}

export const filterEnabledChains = <T>(values: ChainValues<T>): T[] => {
  const result: T[] = []
  Object.entries(values).forEach(([chain, value]) => {
    if (isChain(chain) && isEnabledChain(chain) && value) result.push(...value)
  })

  return result
}
