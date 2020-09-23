import { assetFromString, EMPTY_ASSET } from '@thorchain/asgardex-util'

import { CURRENCY_SYMBOLS } from '../const'
import { PoolAsset } from '../views/pools/types'
import { isRuneAsset, isBnbAsset, getCurrencySymbolByAssetString } from './assetHelper'

describe('helpers/assetHelper', () => {
  describe('isRuneAsset', () => {
    it('checks rune asset for testnet', () => {
      const asset = assetFromString('BNB.RUNE-B1A') || EMPTY_ASSET
      expect(isRuneAsset(asset)).toBeTruthy()
    })

    it('checks rune asset (mainnet)', () => {
      const asset = assetFromString('BNB.RUNE-67C') || EMPTY_ASSET
      expect(isRuneAsset(asset)).toBeTruthy()
    })

    it('returns false for any other asset than RUNE', () => {
      const asset = assetFromString('BNB.BNB') || EMPTY_ASSET
      expect(isRuneAsset(asset)).toBeFalsy()
    })
  })
  describe('isBnbAsset', () => {
    it('checks BNB asset', () => {
      const asset = assetFromString('BNB.BNB') || EMPTY_ASSET
      expect(isBnbAsset(asset)).toBeTruthy()
    })

    it('returns false for any other asset than BNB', () => {
      const asset = assetFromString('BNB.RUNE-B1A') || EMPTY_ASSET
      expect(isBnbAsset(asset)).toBeFalsy()
    })
  })

  describe('getCurrencySymbolByAssetString', () => {
    it('should return rune symbol', () => {
      expect(getCurrencySymbolByAssetString(PoolAsset.RUNEB1A)).toEqual(CURRENCY_SYMBOLS['BNB.RUNE-67C'])
    })

    it('should return ticker for unknown asset', () => {
      expect(getCurrencySymbolByAssetString('chain.ticker-symbol')).toEqual('ticker')
    })

    it('should return empty string for invalid asset', () => {
      expect(getCurrencySymbolByAssetString('invalid asset')).toEqual('')
    })
  })
})
