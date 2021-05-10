import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import { AssetBNB, baseAmount } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { eqBaseAmount, eqODepositAssetFees, eqODepositFees } from '../../../helpers/fp/eq'
import { DepositAssetFees, DepositFees, SymDepositFeesRD } from '../../../services/chain/types'
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
    const runeFee: DepositFees = { inFee: baseAmount(10), outFee: baseAmount(11), refundFee: baseAmount(12) }
    const assetFee: DepositAssetFees = {
      inFee: baseAmount(20),
      outFee: baseAmount(21),
      refundFee: baseAmount(22),
      asset: AssetBNB
    }
    const feesRD: SymDepositFeesRD = RD.success({
      rune: runeFee,
      asset: assetFee
    })

    it('should return chain fees', () => {
      const result = getAssetChainFee(feesRD)
      const expected = O.some(assetFee)
      expect(eqODepositAssetFees.equals(result, expected)).toBeTruthy()
    })

    it('should return ThorChain fees', () => {
      const result = getThorchainFees(feesRD)
      const expected = O.some(runeFee)
      expect(eqODepositFees.equals(result, expected)).toBeTruthy()
    })
  })
})
