import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import { baseAmount } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { eqBaseAmount, eqOptionBaseAmount } from '../../../helpers/fp/eq'
import { DepositFeesRD } from '../../../services/chain/types'
import {
  getAssetAmountToDeposit,
  getRuneAmountToDeposit,
  maxAssetAmountToDeposit,
  maxRuneAmountToDeposit,
  getAssetChainFee,
  getThorchainFees
} from './Deposit.helper'

describe('deposit/Deposit.helper', () => {
  // pool balances
  const poolData: PoolData = {
    runeBalance: baseAmount(200000), //  1 RUNE == 0.5 ASSET
    assetBalance: baseAmount(100000) //  1 ASSET == 2 RUNE
  }
  // user balances
  const runeBalance = baseAmount(10000)
  const assetBalance = baseAmount(20000)

  describe('maxRuneAmountToDeposit', () => {
    it('is 10000', () => {
      const result = maxRuneAmountToDeposit({ poolData, assetBalance, runeBalance })
      expect(eqBaseAmount.equals(result, baseAmount(10000))).toBeTruthy()
    })
    it('is 5000', () => {
      const runeBalance = baseAmount(5000)
      const assetBalance = baseAmount(10000)
      const result = maxRuneAmountToDeposit({ poolData, assetBalance, runeBalance })

      expect(eqBaseAmount.equals(result, baseAmount(5000))).toBeTruthy()
    })
  })

  describe('maxAssetAmountToDeposit', () => {
    it('is 5000', () => {
      const result = maxAssetAmountToDeposit({ poolData, assetBalance, runeBalance })
      expect(eqBaseAmount.equals(result, baseAmount(5000))).toBeTruthy()
    })
    it('is 10000', () => {
      const runeBalance = baseAmount(20000)
      const assetBalance = baseAmount(10000)
      const result = maxAssetAmountToDeposit({ poolData, assetBalance, runeBalance })
      expect(eqBaseAmount.equals(result, baseAmount(10000))).toBeTruthy()
    })
  })

  describe('getRuneAmountToDeposit', () => {
    it('is 10000', () => {
      const assetAmount = baseAmount(5000)
      const result = getRuneAmountToDeposit(assetAmount, poolData)
      expect(eqBaseAmount.equals(result, baseAmount(10000))).toBeTruthy()
    })
    it('is 5000', () => {
      const assetAmount = baseAmount(2500)
      const result = getRuneAmountToDeposit(assetAmount, poolData)
      expect(eqBaseAmount.equals(result, baseAmount(5000))).toBeTruthy()
    })
  })

  describe('getAssetAmountToDeposit', () => {
    it('is 5000', () => {
      const runeAmount = baseAmount(10000)
      const assetDecimal = 6
      const result = getAssetAmountToDeposit({ runeAmount, poolData, assetDecimal })
      expect(eqBaseAmount.equals(result, baseAmount(50, 6))).toBeTruthy()
    })
    it('is 2500', () => {
      const runeAmount = baseAmount(5000)
      const assetDecimal = 12
      const result = getAssetAmountToDeposit({ runeAmount, poolData, assetDecimal })
      expect(eqBaseAmount.equals(result, baseAmount(2500, 8))).toBeTruthy()
    })
  })

  describe('fees getters', () => {
    const depositFeesRD: DepositFeesRD = RD.success({
      thor: O.some(baseAmount(100)),
      asset: baseAmount(123)
    })

    it('should return chain fees', () => {
      expect(eqOptionBaseAmount.equals(getAssetChainFee(depositFeesRD), O.some(baseAmount(123)))).toBeTruthy()
    })

    it('should return ThorChain fees', () => {
      expect(eqOptionBaseAmount.equals(getThorchainFees(depositFeesRD), O.some(baseAmount(100)))).toBeTruthy()

      expect(
        getThorchainFees(
          RD.success({
            thor: O.none,
            asset: baseAmount(123)
          })
        )
      ).toBeNone()
    })
  })
})
