import { PoolAsset, isPoolAsset, isPricePoolAsset } from './types'

describe('view/pools/types', () => {
  describe('isPoolAsset', () => {
    it('returns true for BNB', () => {
      expect(isPoolAsset(PoolAsset.BNB)).toBeTruthy()
    })

    it('returns false for deprecated asset ', () => {
      expect(isPoolAsset('BNB.RUNE-1AF')).toBeFalsy()
    })
  })

  describe('isPricePoolAsset', () => {
    it('returns true for TUSDB', () => {
      expect(isPricePoolAsset(PoolAsset.TUSDB)).toBeTruthy()
    })
    it('returns false for BNB', () => {
      expect(isPricePoolAsset(PoolAsset.BNB)).toBeFalsy()
    })
    it('returns false for deprecated asset ', () => {
      expect(isPricePoolAsset('BNB.RUNE-1AF')).toBeFalsy()
    })
  })
})
