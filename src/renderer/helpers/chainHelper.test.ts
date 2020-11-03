import { AssetBNB, AssetBTC, AssetETH, AssetRune67C, AssetRuneB1A, AssetRuneNative } from '@xchainjs/xchain-util'

import {
  getChainAsset,
  isBaseChain,
  isBaseChainAsset,
  isBtcChain,
  isCrossChain,
  isCrossChainAsset
} from './chainHelper'

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

  describe('isBaseChain', () => {
    it('true for BNB chain', () => {
      expect(isBaseChain('BNB')).toBeTruthy()
    })
    it('false for other chains', () => {
      expect(isBaseChain('BTC')).toBeFalsy()
      expect(isBaseChain('ETH')).toBeFalsy()
      expect(isBaseChain('THOR')).toBeFalsy()
    })
  })

  describe('isBaseChainAsset', () => {
    it('true for BNB asset', () => {
      expect(isBaseChainAsset(AssetBNB)).toBeTruthy()
    })
    it('true for RUNE asset', () => {
      expect(isBaseChainAsset(AssetRune67C)).toBeTruthy()
      expect(isBaseChainAsset(AssetRuneB1A)).toBeTruthy()
    })
    it('false for other assets (e.g. ETH)', () => {
      expect(isBaseChainAsset(AssetETH)).toBeFalsy()
    })
  })

  describe('isCrossChain', () => {
    it('false for BNB chain', () => {
      expect(isCrossChain('BNB')).toBeFalsy()
    })
    it('true for other chains', () => {
      expect(isCrossChain('BTC')).toBeTruthy()
      expect(isCrossChain('ETH')).toBeTruthy()
      expect(isCrossChain('THOR')).toBeTruthy()
    })
  })

  describe('isCrossChainAsset', () => {
    it('false for BNB asset', () => {
      expect(isCrossChainAsset(AssetBNB)).toBeFalsy()
    })
    it('false for RUNE asset', () => {
      expect(isCrossChainAsset(AssetRune67C)).toBeFalsy()
      expect(isCrossChainAsset(AssetRuneB1A)).toBeFalsy()
    })
    it('true for ETH asset', () => {
      expect(isCrossChainAsset(AssetETH)).toBeTruthy()
    })
    it('true for BTC asset', () => {
      expect(isCrossChainAsset(AssetBTC)).toBeTruthy()
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
