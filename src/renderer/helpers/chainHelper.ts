import { Asset } from '@xchainjs/xchain-util'

import {
  AssetATOM,
  AssetBCH,
  AssetBNB,
  AssetBTC,
  AssetDOGE,
  AssetETH,
  AssetLTC,
  AssetRuneNative
} from '../../shared/utils/asset'
import {
  AvalancheChain,
  BCHChain,
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  isChain,
  LTCChain,
  THORChain
} from '../../shared/utils/chain'
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
      return AssetATOM
    case BCHChain:
      return AssetBCH
    case LTCChain:
      return AssetLTC
    case DOGEChain:
      return AssetDOGE
    case AvalancheChain:
      throw Error('AVAX is not supported yet')
  }
}

/**
 * Check whether chain is BTC chain
 */
export const isBtcChain = (chain: string): boolean => isChain(chain) && eqChain.equals(chain, BTCChain)

/**
 * Check whether chain is LTC chain
 */
export const isLtcChain = (chain: string): boolean => isChain(chain) && eqChain.equals(chain, LTCChain)

/**
 * Check whether chain is THOR chain
 */
export const isThorChain = (chain: string): boolean => isChain(chain) && eqChain.equals(chain, THORChain)

/**
 * Check whether chain is BNB chain
 */
export const isBnbChain = (chain: string): boolean => isChain(chain) && eqChain.equals(chain, BNBChain)

/**
 * Check whether chain is ETH chain
 */
export const isEthChain = (chain: string): boolean => isChain(chain) && eqChain.equals(chain, ETHChain)

/**
 * Check whether chain is BCH chain
 */
export const isBchChain = (chain: string): boolean => isChain(chain) && eqChain.equals(chain, BCHChain)

/**
 * Check whether chain is DOGE chain
 */
export const isDogeChain = (chain: string): boolean => isChain(chain) && eqChain.equals(chain, DOGEChain)

/**
 * Check whether chain is Cosmos (GAIA) chain
 */
export const isCosmosChain = (chain: string): boolean => isChain(chain) && eqChain.equals(chain, CosmosChain)

export const isEnabledChain = (chain: string) => isChain(chain) && ENABLED_CHAINS.includes(chain)

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
