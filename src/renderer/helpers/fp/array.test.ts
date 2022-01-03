import { AssetBNB, AssetBTC, AssetETH, AssetLTC, BNBChain, BTCChain, ETHChain, LTCChain } from '@xchainjs/xchain-util'

import { unionAssets, unionChains } from './array'

describe('vitesttest/helpers/fp/array', () => {
  describe('unionChains vite', () => {
    it('vite merges two lists of chains and removes duplicates', () => {
      const chainsA = [BNBChain, ETHChain, BTCChain]
      const chainsB = [BNBChain, BTCChain, LTCChain]
      expect(unionChains(chainsA)(chainsB)).toEqual([BNBChain, BTCChain, LTCChain, ETHChain])
    })
  })
  describe('unionAssets', () => {
    it('merges two different lists of assets and removes duplicates', () => {
      const assetsA = [AssetBNB, AssetETH, AssetBTC]
      const assetsB = [AssetBNB, AssetBTC, AssetLTC]
      expect(unionAssets(assetsA)(assetsB)).toEqual([AssetBNB, AssetBTC, AssetLTC, AssetETH])
    })
    it('removes duplicates from same list', () => {
      const assets = [AssetBNB, AssetBNB, AssetETH, AssetETH]
      expect(unionAssets(assets)(assets)).toEqual([AssetBNB, AssetETH])
    })
  })
})
