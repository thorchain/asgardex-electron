import { bn, baseAmount, AssetBTC, AssetRuneNative } from '@xchainjs/xchain-util'

import { ordBigNumber, ordBaseAmount, ordAsset } from './ord'

describe('helpers/fp/ord', () => {
  describe('ordBigNumber', () => {
    it('is greater', () => {
      expect(ordBigNumber.compare(bn(1.01), bn(1))).toEqual(1)
    })
    it('is less', () => {
      expect(ordBigNumber.compare(bn(1), bn(1.01))).toEqual(-1)
    })
  })
  describe('ordBaseAmount', () => {
    it('is greater', () => {
      expect(ordBaseAmount.compare(baseAmount(101), baseAmount(1))).toEqual(1)
    })
    it('is less', () => {
      expect(ordBaseAmount.compare(baseAmount(1), baseAmount(101))).toEqual(-1)
    })
    it('is equal', () => {
      expect(ordBaseAmount.compare(baseAmount(1), baseAmount(1))).toEqual(0)
    })
  })
  describe('ordAsset', () => {
    it('is less', () => {
      expect(ordAsset.compare(AssetRuneNative, AssetBTC)).toEqual(1)
    })
    it('is grreater', () => {
      expect(ordAsset.compare(AssetBTC, AssetRuneNative)).toEqual(-1)
    })
    it('is equal', () => {
      expect(ordAsset.compare(AssetBTC, AssetBTC)).toEqual(0)
    })
  })
})
