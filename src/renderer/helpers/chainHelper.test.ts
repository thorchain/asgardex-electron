import {
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetRuneNative,
  BNBChain,
  BTCChain,
  ETHChain,
  THORChain
} from '@xchainjs/xchain-util'

import { getChainAsset, isBtcChain, isThorChain } from './chainHelper'

describe('helpers/chainHelper', () => {
  describe('getChainAsset', () => {
    it('returns asset for BNB chain', () => {
      expect(getChainAsset(BNBChain)).toEqual(AssetBNB)
    })
    it('returns asset for BTC chain', () => {
      expect(getChainAsset(BTCChain)).toEqual(AssetBTC)
    })
    it('returns asset for ETH chain', () => {
      expect(getChainAsset(ETHChain)).toEqual(AssetETH)
    })
    it('returns asset for THOR chain', () => {
      expect(getChainAsset(THORChain)).toEqual(AssetRuneNative)
    })
  })

  describe('isBtcChain', () => {
    it('true for BTC chain', () => {
      expect(isBtcChain(BTCChain)).toBeTruthy()
    })
    it('false for other chains (e.g. ETH)', () => {
      expect(isBtcChain(ETHChain)).toBeFalsy()
    })
  })

  describe('isThorChain', () => {
    it('true for THOR chain', () => {
      expect(isThorChain(THORChain)).toBeTruthy()
    })
    it('false for other chains (e.g. ETH)', () => {
      expect(isThorChain(ETHChain)).toBeFalsy()
    })
  })
})
