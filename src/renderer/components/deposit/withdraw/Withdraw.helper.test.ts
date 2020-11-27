import { baseAmount, bn } from '@xchainjs/xchain-util'

import { getWithdrawAmounts } from './Withdraw.helper'

describe('stake/Withdraw.helper', () => {
  describe('getWithdrawAmounts', () => {
    it('zero percentes', () => {
      const withdraws = getWithdrawAmounts(baseAmount('193011422'), baseAmount('3202499'), 0)
      expect(withdraws.runeWithdraw.amount()).toEqual(bn(0))
      expect(withdraws.assetWithdraw.amount()).toEqual(bn(0))
    })

    it('50 percentes', () => {
      const withdraws = getWithdrawAmounts(baseAmount('193011422'), baseAmount('3202499'), 50)
      expect(withdraws.runeWithdraw.amount()).toEqual(bn(0.96505711))
      expect(withdraws.assetWithdraw.amount()).toEqual(bn(0.0160125))
    })

    it('100 percentes', () => {
      const withdraws = getWithdrawAmounts(baseAmount('193011422'), baseAmount('3202499'), 100)
      expect(withdraws.runeWithdraw.amount()).toEqual(bn(1.93011422))
      expect(withdraws.assetWithdraw.amount()).toEqual(bn(0.03202499))
    })
  })
})
