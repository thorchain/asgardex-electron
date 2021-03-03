import { getSwapMemo as asgardexGetSwapMemo, getDepositMemo as asgardexGetDepositMemo } from '@thorchain/asgardex-util'
import { Address } from '@xchainjs/xchain-client'
import { Asset, BCHChain } from '@xchainjs/xchain-util'

export const getSwapMemo = (asset: Asset, address?: Address): string => {
  if (asset.chain === BCHChain && address) {
    const prefixIndex = address.indexOf(':') + 1

    return asgardexGetSwapMemo({
      asset,
      address: address.substr(prefixIndex > 0 ? prefixIndex : 0)
    })
  }
  return asgardexGetSwapMemo({ asset, address })
}

export const getDepositMemo = (asset: Asset, address?: Address): string => {
  if (asset.chain === BCHChain && address) {
    const prefixIndex = address.indexOf(':') + 1

    return asgardexGetDepositMemo(asset, address.substr(prefixIndex > 0 ? prefixIndex : 0))
  }
  return asgardexGetDepositMemo(asset, address)
}
