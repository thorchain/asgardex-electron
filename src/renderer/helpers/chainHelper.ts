import { Asset, AssetBNB, AssetBTC, AssetETH, AssetRuneNative, Chain } from '@thorchain/asgardex-util'

import { BASE_CHAIN } from '../const'
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
  }
}

/**
 * Check whether chain is BASE chain
 */
export const isBaseChain = (chain: Chain): chain is typeof BASE_CHAIN => eqChain.equals(chain, BASE_CHAIN)

/**
 * Check whether asset is a BASE chain asset
 */
export const isBaseChainAsset = ({ chain }: Asset): boolean => isBaseChain(chain)

/**
 * Check whether chain is BTC chain
 */
export const isBtcChain = (chain: Chain): boolean => eqChain.equals(chain, 'BTC')
