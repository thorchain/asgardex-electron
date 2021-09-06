import { AssetRuneNative } from '@xchainjs/xchain-util'

import { isAsset } from './guard'

describe('shared/guard', () => {
  describe('isAsset', () => {
    it('true for "THOR.RUNE"', () => {
      expect(isAsset('THOR.RUNE')).toBeTruthy()
    })
    it('true for AssetRuneNative', () => {
      expect(isAsset(AssetRuneNative)).toBeTruthy()
    })
    it('false for invalid chain ', () => {
      expect(isAsset({ symbol: 'THOR', chain: 'INVALID', ticker: 'RUNE' })).toBeFalsy()
    })
    it('false for invalid string ', () => {
      expect(isAsset('invalid')).toBeFalsy()
    })
  })
})
