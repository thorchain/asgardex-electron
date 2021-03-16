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
    runeBalance: baseAmount(2000), //  1 RUNE == 0.5 ASSET
    assetBalance: baseAmount(1000) //  1 ASSET == 2 RUNE
  }
  // user balances
  const runeBalance = baseAmount(100) // 100 RUNE = 50 ASSET
  const assetBalance = baseAmount(200) // 200 ASSET = 100 RUNE

  describe('maxRuneAmountToDeposit', () => {
    it('is 100', () => {
      const result = maxRuneAmountToDeposit({ poolData, assetBalance, runeBalance })
      expect(eqBaseAmount.equals(result, baseAmount(100))).toBeTruthy()
    })
    it('is 50', () => {
      const runeBalance = baseAmount(50)
      const assetBalance = baseAmount(100)
      const result = maxRuneAmountToDeposit({ poolData, assetBalance, runeBalance })

      expect(eqBaseAmount.equals(result, baseAmount(50))).toBeTruthy()
    })
  })

  describe('maxAssetAmountToDeposit', () => {
    it('is 200', () => {
      const result = maxAssetAmountToDeposit({ poolData, assetBalance, runeBalance })
      expect(eqBaseAmount.equals(result, baseAmount(200))).toBeTruthy()
    })
    it('is 100', () => {
      const runeBalance = baseAmount(200)
      const assetBalance = baseAmount(100)
      const result = maxAssetAmountToDeposit({ poolData, assetBalance, runeBalance })
      expect(eqBaseAmount.equals(result, baseAmount(100))).toBeTruthy()
    })
  })

  describe('getRuneAmountToDeposit', () => {
    it('is 100', () => {
      const assetAmount = baseAmount(50)
      const result = getRuneAmountToDeposit(assetAmount, poolData)
      expect(eqBaseAmount.equals(result, baseAmount(100))).toBeTruthy()
    })
    it('is 50', () => {
      const assetAmount = baseAmount(25)
      const result = getRuneAmountToDeposit(assetAmount, poolData)
      expect(eqBaseAmount.equals(result, baseAmount(50))).toBeTruthy()
    })
  })

  describe('getAssetAmountToDeposit', () => {
    it('is 50', () => {
      const runeAmount = baseAmount(100)
      const result = getAssetAmountToDeposit(runeAmount, poolData)
      expect(eqBaseAmount.equals(result, baseAmount(50))).toBeTruthy()
    })
    it('is 25', () => {
      const runeAmount = baseAmount(50)
      const result = getAssetAmountToDeposit(runeAmount, poolData)
      expect(eqBaseAmount.equals(result, baseAmount(25))).toBeTruthy()
    })
  })
})
