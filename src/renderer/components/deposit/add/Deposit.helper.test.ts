import { PoolData } from '@thorchain/asgardex-util'
import { baseAmount } from '@xchainjs/xchain-util'

import { eqBaseAmount } from '../../../helpers/fp/eq'
import {
  getAssetAmountToDeposit,
  getRuneAmountToDeposit,
  maxAssetAmountToDeposit,
  maxRuneAmountToDeposit
} from './Deposit.helper'

describe('deposit/Deposit.helper', () => {
  // pool balances
  const poolData: PoolData = {
    runeBalance: baseAmount(200000), //  1 RUNE == 0.5 ASSET
    assetBalance: baseAmount(100000) //  1 ASSET == 2 RUNE
  }
  // user balances
  const runeBalance = baseAmount(10000) // 100 RUNE = 50 ASSET
  const assetBalance = baseAmount(20000) // 200 ASSET = 100 RUNE

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
      // const poolData: PoolData = {
      //   runeBalance: baseAmount(2000), //  1 RUNE == 0.5 ASSET
      //   assetBalance: baseAmount(1000, 6) //  1 ASSET == 2 RUNE
      // }
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
})
