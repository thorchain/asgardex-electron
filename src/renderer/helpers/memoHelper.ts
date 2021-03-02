import { getSwapMemo as asgardexGetSwapMemo } from '@thorchain/asgardex-util'
import { Address } from '@xchainjs/xchain-client'
import { Asset, BCHChain } from '@xchainjs/xchain-util'

import { Network } from '../../shared/api/types'
import { getAddressPrefixLength } from './addressHelper'

export const getSwapMemo = (asset: Asset, network: Network, address: Address): string => {
  if (asset.chain === BCHChain) {
    return asgardexGetSwapMemo({
      asset,
      address: address.substr(getAddressPrefixLength(asset.chain, network))
    })
  }
  return asgardexGetSwapMemo({ asset, address })
}
