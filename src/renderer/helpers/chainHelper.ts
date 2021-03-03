import { AssetAtom } from '@xchainjs/xchain-cosmos'
import { AssetDOT } from '@xchainjs/xchain-polkadot'
import {
  Asset,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetRuneNative,
  AssetLTC,
  Chain,
  isChain,
  AssetBCH
} from '@xchainjs/xchain-util'

import { ENABLED_CHAINS } from '../services/const'
import { ChainValues } from '../types/asgardex'
import { eqChain } from './fp/eq'

export const getChainAsset = (chain: Chain): Asset => {
  switch (chain) {
    case 'BNB':
      return AssetBNB
    case 'BTC':
      return AssetBTC
    case 'ETH':
      return AssetETH
    case 'THOR':
      return AssetRuneNative
    case 'GAIA':
      return AssetAtom
    case 'POLKA':
      return AssetDOT
    case 'BCH':
      return AssetBCH
    case 'LTC':
      return AssetLTC
  }
}

/**
 * Check whether chain is BTC chain
 */
export const isBtcChain = (chain: Chain): boolean => eqChain.equals(chain, 'BTC')

/**
 * Check whether chain is THOR chain
 */
export const isThorChain = (chain: Chain): boolean => eqChain.equals(chain, 'THOR')

/**
 * Check whether chain is BNB chain
 */
export const isBnbChain = (chain: Chain): boolean => eqChain.equals(chain, 'BNB')

/**
 * Check whether chain is ETH chain
 */
export const isEthChain = (chain: Chain): boolean => eqChain.equals(chain, 'ETH')

export const isEnabledChain = (chain: Chain) => ENABLED_CHAINS.includes(chain)

export const filterEnabledChains = <T>(values: ChainValues<T>): T[] => {
  const result: T[] = []
  Object.entries(values).forEach(([chain, value]) => {
    if (isChain(chain) && isEnabledChain(chain) && value) result.push(...value)
  })

  return result
}
