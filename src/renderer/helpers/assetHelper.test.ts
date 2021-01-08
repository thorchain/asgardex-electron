import { AssetBNB, AssetBTC, AssetETH, AssetRuneNative } from '@xchainjs/xchain-util'

import { AssetBUSDBAF, AssetBUSDBD1 } from '../const'
import { isBnbAsset, isBtcAsset, isEthAsset, isPricePoolAsset, isRuneNativeAsset } from './assetHelper'

describe('helpers/assetHelper', () => {
  describe('isRuneNativeAsset', () => {
    it('checks rune asset for testnet', () => {
      expect(isRuneNativeAsset(AssetRuneNative)).toBeTruthy()
    })

    it('returns false for any other asset than RUNE', () => {
      expect(isRuneNativeAsset(AssetBNB)).toBeFalsy()
    })
  })

  describe('isBnbAsset', () => {
    it('checks BNB asset', () => {
      expect(isBnbAsset(AssetBNB)).toBeTruthy()
    })
  })

  describe('isBtcAsset', () => {
    it('checks BTC asset', () => {
      expect(isBtcAsset(AssetBTC)).toBeTruthy()
    })
  })

  describe('isEthAsset', () => {
    it('checks ETH asset', () => {
      expect(isEthAsset(AssetETH)).toBeTruthy()
    })
  })

  describe('isPricePoolAsset', () => {
    it('returns true for BUSDB', () => {
      expect(isPricePoolAsset(AssetBUSDBAF)).toBeTruthy()
      expect(isPricePoolAsset(AssetBUSDBD1)).toBeTruthy()
    })
    it('returns false for BNB', () => {
      expect(isPricePoolAsset(AssetBNB)).toBeFalsy()
    })
    it('returns false for deprecated asset ', () => {
      expect(isPricePoolAsset({ chain: 'BNB', symbol: 'RUNE-1AF', ticker: 'RUNE' })).toBeFalsy()
    })
  })
})
