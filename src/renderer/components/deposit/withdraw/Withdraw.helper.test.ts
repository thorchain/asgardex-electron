import { baseAmount } from '@xchainjs/xchain-util'

import { ZERO_BASE_AMOUNT } from '../../../const'
import { eqBaseAmount } from '../../../helpers/fp/eq'
import { getWithdrawAmounts, sumWithdrawFees } from './Withdraw.helper'

describe('stake/Withdraw.helper', () => {
  describe('getWithdrawAmounts', () => {
    it('zero percentes', () => {
      const withdraws = getWithdrawAmounts(baseAmount('193011422'), baseAmount('3202499'), 0)
      expect(eqBaseAmount.equals(withdraws.rune, ZERO_BASE_AMOUNT)).toBeTruthy()
      expect(eqBaseAmount.equals(withdraws.asset, ZERO_BASE_AMOUNT)).toBeTruthy()
    })

    it('50 percentes', () => {
      const withdraws = getWithdrawAmounts(baseAmount('193011422'), baseAmount('3202499'), 50)
      expect(eqBaseAmount.equals(withdraws.rune, baseAmount(96505711))).toBeTruthy()
      expect(eqBaseAmount.equals(withdraws.asset, baseAmount(1601250))).toBeTruthy()
    })

    it('100 percentes', () => {
      const withdraws = getWithdrawAmounts(baseAmount('193011422'), baseAmount('3202499'), 100)
      expect(eqBaseAmount.equals(withdraws.rune, baseAmount(193011422))).toBeTruthy()
      expect(eqBaseAmount.equals(withdraws.asset, baseAmount(3202499))).toBeTruthy()
    })
  })

  describe('sumWithdrawFees', () => {
    it('sums inFee + outFee', () => {
      const fees = {
        inFee: baseAmount(100),
        outFee: baseAmount(300)
      }
      const result = sumWithdrawFees(fees)
      expect(eqBaseAmount.equals(result, baseAmount(400))).toBeTruthy()
    })
  })
})
