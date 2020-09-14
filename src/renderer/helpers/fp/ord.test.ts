import { bn, baseAmount } from '@thorchain/asgardex-util'

import { ordBigNumber, ordBaseAmount } from './ord'

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
  })
})
