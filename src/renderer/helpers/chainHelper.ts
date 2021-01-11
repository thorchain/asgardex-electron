import { AssetAtom } from '@xchainjs/xchain-cosmos'
import { AssetDOT } from '@xchainjs/xchain-polkadot'
import { Asset, AssetBNB, AssetBTC, AssetETH, AssetRuneNative, Chain } from '@xchainjs/xchain-util'

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
  }
}

/**
 * Check whether chain is BTC chain
 */
export const isBtcChain = (chain: Chain): boolean => eqChain.equals(chain, 'BTC')
