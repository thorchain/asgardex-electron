import { AssetBNB, AssetBTC, AssetETH, AssetRune67C, AssetRuneB1A, AssetRuneNative } from '@thorchain/asgardex-util'

import { isRuneAsset, isBnbAsset, getRuneAsset, isBtcAsset, isEthAsset } from './assetHelper'

describe('helpers/assetHelper', () => {
  describe('getRuneAsset', () => {
    it('returns Rune asset for testnet / BNB chain', () => {
      expect(getRuneAsset({ network: 'testnet', chain: 'BNB' })).toEqual(AssetRune67C)
    })
    it('returns Rune asset for mainnet / BNB chain', () => {
      expect(getRuneAsset({ network: 'mainnet', chain: 'BNB' })).toEqual(AssetRuneB1A)
    })
    it('returns Rune asset for Thorchain', () => {
      expect(getRuneAsset({ chain: 'THOR' })).toEqual(AssetRuneNative)
    })
  })

  describe('isRuneAsset', () => {
    it('checks rune asset for testnet', () => {
      expect(isRuneAsset(AssetRuneB1A)).toBeTruthy()
    })

    it('checks rune asset (mainnet)', () => {
      expect(isRuneAsset(AssetRune67C)).toBeTruthy()
    })

    it('returns false for any other asset than RUNE', () => {
      expect(isRuneAsset(AssetBNB)).toBeFalsy()
    })
  })

  describe('isBnbAsset', () => {
    it('checks BNB asset', () => {
      expect(isBnbAsset(AssetBNB)).toBeTruthy()
    })

    it('returns false for any other asset than BNB', () => {
      expect(isBnbAsset(AssetRuneB1A)).toBeFalsy()
    })
  })

  describe('isBtcAsset', () => {
    it('checks BTC asset', () => {
      expect(isBtcAsset(AssetBTC)).toBeTruthy()
    })

    it('returns false for any other asset than BTC', () => {
      expect(isBnbAsset(AssetRuneB1A)).toBeFalsy()
    })
  })

  describe('isEthAsset', () => {
    it('checks ETH asset', () => {
      expect(isEthAsset(AssetETH)).toBeTruthy()
    })

    it('returns false for any other asset than ETH', () => {
      expect(isBnbAsset(AssetRuneB1A)).toBeFalsy()
    })
  })
})
