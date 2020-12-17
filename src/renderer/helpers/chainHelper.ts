import { AssetAtom } from '@xchainjs/xchain-cosmos'
import { AssetDOT } from '@xchainjs/xchain-polkadot'
import { Asset, AssetBNB, AssetBTC, AssetETH, AssetRuneNative, Chain } from '@xchainjs/xchain-util'

import { BASE_CHAIN } from '../const'
import { eqAsset, eqChain } from './fp/eq'

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
 * Check whether chain is BASE chain
 * @deprecated
 * TODO (@Veado) Remove it
 */
export const isBaseChain = (chain: Chain): chain is typeof BASE_CHAIN => eqChain.equals(chain, BASE_CHAIN)

/**
 * Check whether asset is a BASE chain asset
 * @deprecated
 * TODO (@Veado) Remove it
 */
export const isBaseChainAsset = ({ chain }: Asset): boolean => isBaseChain(chain)

/**
 * Check whether chain is a CROSS chain
 * @deprecated
 * TODO (@Veado) Remove it
 */
export const isCrossChain = (chain: Chain): boolean => !isBaseChain(chain)

/**
 * Check whether asset is a CROSS chain asset
 * @deprecated
 * TODO (@Veado) Remove it
 */
export const isCrossChainAsset = (asset: Asset): boolean => {
  if (isBaseChainAsset(asset)) return false
  const crossChainAsset = getChainAsset(asset.chain)
  return eqAsset.equals(crossChainAsset, asset)
}

/**
 * Check whether chain is BTC chain
 */
export const isBtcChain = (chain: Chain): boolean => eqChain.equals(chain, 'BTC')
