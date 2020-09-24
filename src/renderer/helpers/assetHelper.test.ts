import { AssetBNB, AssetRune67C, AssetRuneB1A, AssetRuneNative } from '@thorchain/asgardex-util'

import { CURRENCY_SYMBOLS } from '../const'
import { PoolAsset } from '../views/pools/types'
import { isRuneAsset, isBnbAsset, getCurrencySymbolByAssetString, getRuneAsset } from './assetHelper'

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

  describe('getCurrencySymbolByAssetString', () => {
    it('should return rune symbol', () => {
      expect(getCurrencySymbolByAssetString(PoolAsset.RUNEB1A)).toEqual(CURRENCY_SYMBOLS['BNB.RUNE-67C'])
    })

    it('should return ticker for unknown asset', () => {
      expect(getCurrencySymbolByAssetString('BNB.ticker-symbol')).toEqual('ticker')
    })

    it('should return empty string for invalid asset', () => {
      expect(getCurrencySymbolByAssetString('invalid asset')).toEqual('')
    })
  })
})
