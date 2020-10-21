import { bnOrZero } from '@thorchain/asgardex-util'

import { getWithdrawAmountsFactory } from './Withdraw.helper'

describe('stake/Withdraw.helper', () => {
  describe('getWithdrawAmounts', () => {
    const getWithdrawAmounts = getWithdrawAmountsFactory(
      {
        poolUnits: '178806928424995',
        runeDepth: '480244483866649',
        assetDepth: '7968349234845',
        asset: 'BNB.BNB'
      },
      {
        asset: 'BNB.BNB',
        assetStaked: '2959329',
        assetWithdrawn: '0',
        dateFirstStaked: 1600943752,
        heightLastStaked: 512555,
        runeStaked: '200000000',
        runeWithdrawn: '0',
        units: '71862938'
      }
    )

    it('zero percentes', () => {
      const withdraws = getWithdrawAmounts(0)
      expect(withdraws.runeWithdraw.amount()).toEqual(bnOrZero(0))
      expect(withdraws.assetWithdraw.amount()).toEqual(bnOrZero(0))
    })

    it('50 percentes', () => {
      const withdraws = getWithdrawAmounts(50)
      expect(withdraws.runeWithdraw.amount()).toEqual(bnOrZero(0.96505711))
      expect(withdraws.assetWithdraw.amount()).toEqual(bnOrZero(0.01601249))
    })

    it('100 percentes', () => {
      const withdraws = getWithdrawAmounts(100)
      expect(withdraws.runeWithdraw.amount()).toEqual(bnOrZero(1.93011422))
      expect(withdraws.assetWithdraw.amount()).toEqual(bnOrZero(0.03202499))
    })
  })
})
