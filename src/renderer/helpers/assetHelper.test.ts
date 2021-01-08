import { AssetBNB, AssetBTC, AssetETH, AssetRune67C, AssetRuneB1A, AssetRuneNative } from '@xchainjs/xchain-util'

import { AssetBUSDBAF, AssetBUSDBD1 } from '../const'
import { isBnbAsset, isBtcAsset, isEthAsset, isPricePoolAsset, isRuneBnbAsset, isRuneNativeAsset } from './assetHelper'

describe('helpers/assetHelper', () => {
  describe('isRuneBnbAsset', () => {
    it('checks rune asset for testnet', () => {
      expect(isRuneBnbAsset(AssetRuneB1A)).toBeTruthy()
    })

    it('checks rune asset (mainnet)', () => {
      expect(isRuneBnbAsset(AssetRune67C)).toBeTruthy()
    })

    it('returns false for any other asset than RUNE', () => {
      expect(isRuneBnbAsset(AssetBNB)).toBeFalsy()
    })
  })

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
