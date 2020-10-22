import { bn } from '@thorchain/asgardex-util'

import { getWithdrawAmountsFactory } from './Withdraw.helper'

describe('stake/Withdraw.helper', () => {
  describe('getWithdrawAmounts', () => {
    const getWithdrawAmounts = getWithdrawAmountsFactory(
      '178806928424995',
      '480244483866649',
      '7968349234845',
      '71862938'
    )

    it('zero percentes', () => {
      const withdraws = getWithdrawAmounts(0)
      expect(withdraws.runeWithdraw.amount()).toEqual(bn(0))
      expect(withdraws.assetWithdraw.amount()).toEqual(bn(0))
    })

    it('50 percentes', () => {
      const withdraws = getWithdrawAmounts(50)
      expect(withdraws.runeWithdraw.amount()).toEqual(bn(0.96505711))
      expect(withdraws.assetWithdraw.amount()).toEqual(bn(0.0160125))
    })

    it('100 percentes', () => {
      const withdraws = getWithdrawAmounts(100)
      expect(withdraws.runeWithdraw.amount()).toEqual(bn(1.93011422))
      expect(withdraws.assetWithdraw.amount()).toEqual(bn(0.03202499))
    })
  })
})
