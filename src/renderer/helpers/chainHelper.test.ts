import { AssetBNB, AssetBTC, AssetETH, AssetRuneNative } from '@xchainjs/xchain-util'

import { getChainAsset, isBtcChain } from './chainHelper'

describe('helpers/chainHelper', () => {
  describe('getChainAsset', () => {
    it('returns asset for BNB chain', () => {
      expect(getChainAsset('BNB')).toEqual(AssetBNB)
    })
    it('returns asset for BTC chain', () => {
      expect(getChainAsset('BTC')).toEqual(AssetBTC)
    })
    it('returns asset for ETH chain', () => {
      expect(getChainAsset('ETH')).toEqual(AssetETH)
    })
    it('returns asset for THOR chain', () => {
      expect(getChainAsset('THOR')).toEqual(AssetRuneNative)
    })
  })

  describe('isBtcChain', () => {
    it('true for BTC chain', () => {
      expect(isBtcChain('BTC')).toBeTruthy()
    })
    it('false for other chains (e.g. ETH)', () => {
      expect(isBtcChain('ETH')).toBeFalsy()
    })
  })
})
