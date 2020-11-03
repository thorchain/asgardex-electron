import { baseAmount, PoolData } from '@xchainjs/xchain-util'

import { eqBaseAmount } from '../../../helpers/fp/eq'
import {
  getAssetAmountToStake,
  getRuneAmountToStake,
  maxAssetAmountToStake,
  maxRuneAmountToStake
} from './AddStake.helper'

describe('stake/AddStake.helper', () => {
  // pool balances
  const poolData: PoolData = {
    runeBalance: baseAmount(2000), //  1 RUNE == 0.5 ASSET
    assetBalance: baseAmount(1000) //  1 ASSET == 2 RUNE
  }
  // user balances
  const runeBalance = baseAmount(100) // 100 RUNE = 50 ASSET
  const assetBalance = baseAmount(200) // 200 ASSET = 100 RUNE

  describe('maxRuneAmountToStake', () => {
    it('is 100', () => {
      const result = maxRuneAmountToStake({ poolData, assetBalance, runeBalance })
      expect(eqBaseAmount.equals(result, baseAmount(100))).toBeTruthy()
    })
    it('is 50', () => {
      const runeBalance = baseAmount(50)
      const assetBalance = baseAmount(100)
      const result = maxRuneAmountToStake({ poolData, assetBalance, runeBalance })
      expect(eqBaseAmount.equals(result, baseAmount(50))).toBeTruthy()
    })
  })

  describe('maxAssetAmountToStake', () => {
    it('is 50', () => {
      const result = maxAssetAmountToStake({ poolData, assetBalance, runeBalance })
      expect(eqBaseAmount.equals(result, baseAmount(50))).toBeTruthy()
    })
    it('is 100', () => {
      const runeBalance = baseAmount(200)
      const assetBalance = baseAmount(100)
      const result = maxAssetAmountToStake({ poolData, assetBalance, runeBalance })

      expect(eqBaseAmount.equals(result, baseAmount(100))).toBeTruthy()
    })
  })

  describe('getRuneAmountToStake', () => {
    it('is 100', () => {
      const assetAmount = baseAmount(50)
      const result = getRuneAmountToStake(assetAmount, poolData)
      expect(eqBaseAmount.equals(result, baseAmount(100))).toBeTruthy()
    })
    it('is 50', () => {
      const assetAmount = baseAmount(25)
      const result = getRuneAmountToStake(assetAmount, poolData)
      expect(eqBaseAmount.equals(result, baseAmount(50))).toBeTruthy()
    })
  })

  describe('getAssetAmountToStake', () => {
    it('is 50', () => {
      const runeAmount = baseAmount(100)
      const result = getAssetAmountToStake(runeAmount, poolData)
      expect(eqBaseAmount.equals(result, baseAmount(50))).toBeTruthy()
    })
    it('is 25', () => {
      const runeAmount = baseAmount(50)
      const result = getAssetAmountToStake(runeAmount, poolData)
      expect(eqBaseAmount.equals(result, baseAmount(25))).toBeTruthy()
    })
  })
})
