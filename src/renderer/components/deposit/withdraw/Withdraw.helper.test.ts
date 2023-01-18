import { ETH_DECIMAL } from '@xchainjs/xchain-ethereum'
import { assetAmount, assetToBase, baseAmount } from '@xchainjs/xchain-util'

import { AssetBNB, AssetETH } from '../../../../shared/utils/asset'
import { AssetBUSD74E, AssetUSDTERC20Testnet, ZERO_BASE_AMOUNT } from '../../../const'
import { BNB_DECIMAL, THORCHAIN_DECIMAL } from '../../../helpers/assetHelper'
import { eqBaseAmount } from '../../../helpers/fp/eq'
import {
  getWithdrawAmounts,
  minAssetAmountToWithdrawMax1e8,
  minRuneAmountToWithdraw,
  sumWithdrawFees
} from './Withdraw.helper'

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

  describe('minAssetAmountToWithdrawMax1e8', () => {
    const poolsData = {
      'BNB.BUSD-74E': {
        assetBalance: assetToBase(assetAmount(20)), // 1 BUSD = 0.05 RUNE
        runeBalance: assetToBase(assetAmount(1)) // 1 RUNE = 20 BUSD
      },
      'ETH.USDT-0xa3910454bf2cb59b8b3a401589a3bacc5ca42306': {
        assetBalance: assetToBase(assetAmount(20)), // 1 USDT = 0.05 RUNE
        runeBalance: assetToBase(assetAmount(1)) // 1 RUNE = 20 USDT
      },
      'BNB.BNB': {
        assetBalance: assetToBase(assetAmount(1)), // 1 BNB = 30 RUNE (600 USD)
        runeBalance: assetToBase(assetAmount(30)) // 1 RUNE = 0.03 BNB
      },
      'ETH.ETH': {
        assetBalance: assetToBase(assetAmount(1)), // 1 ETH = 100 RUNE (2000 USD)
        runeBalance: assetToBase(assetAmount(100)) // 1 RUNE = 0.01 ETH
      }
    }

    it('witdhraw chain asset (BNB.BNB)', () => {
      const params = {
        fees: {
          asset: AssetBNB,
          amount: assetToBase(assetAmount(0.0003, BNB_DECIMAL))
        },
        asset: AssetBNB,
        assetDecimal: BNB_DECIMAL,
        poolsData
      }

      // Prices
      // All in BNB
      //
      // Formula:
      // 1,5 * feeInBNB
      // 1,5 * 0.0003 = 0.00045

      const result = minAssetAmountToWithdrawMax1e8(params)
      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(0.00045, BNB_DECIMAL)))).toBeTruthy()
    })

    it('witdhraw non chain asset (BNB.USD)', () => {
      const withdrawAssetDecimal = 8
      const params = {
        fees: {
          asset: AssetBNB,
          amount: assetToBase(assetAmount(0.0003, BNB_DECIMAL))
        },
        asset: AssetBUSD74E,
        assetDecimal: withdrawAssetDecimal,
        poolsData
      }

      // Prices
      // 1 BNB = 600 BUSD or 1 BUSD = 0,001666667 BNB
      //
      // Formula:
      // 1,5 * feeInBUSD
      // 1,5 * 0.0003 * 600 = 0.27

      const result = minAssetAmountToWithdrawMax1e8(params)
      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(0.27, withdrawAssetDecimal)))).toBeTruthy()
    })

    it('withdraw ERC20 token asset (ETH.USDT)', () => {
      const withdrawAssetDecimal = 7
      const params = {
        fees: {
          asset: AssetETH,
          amount: assetToBase(assetAmount(0.03, ETH_DECIMAL))
        },
        asset: AssetUSDTERC20Testnet,
        assetDecimal: withdrawAssetDecimal,
        poolsData
      }

      // Prices
      // 1 ETH = 2000 USDT or 1 USDT = 0,0005 ETH
      //
      // Formula (success):
      // 1.5 * feeInUSDT
      // 1.5 * 0.03 * 2000 = 90

      const result = minAssetAmountToWithdrawMax1e8(params)
      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(90, withdrawAssetDecimal)))).toBeTruthy()
    })

    describe('minRuneAmountToWithdraw', () => {
      it('withdraw RUNE', () => {
        const fees = {
          outFee: assetToBase(assetAmount(0.06, THORCHAIN_DECIMAL))
        }

        // Prices
        // All in RUNE
        //
        // Formula (success):
        // 1.5 * feeInRUNE
        // 1.5 * 0.06 = 0.09

        const result = minRuneAmountToWithdraw(fees)
        expect(eqBaseAmount.equals(result, assetToBase(assetAmount(0.09, THORCHAIN_DECIMAL)))).toBeTruthy()
      })
    })
  })
})
