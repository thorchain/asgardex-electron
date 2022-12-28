import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import { BTC_DECIMAL } from '@xchainjs/xchain-bitcoin'
import { ETH_DECIMAL } from '@xchainjs/xchain-ethereum'
import { assetAmount, AssetBNB, AssetBTC, AssetETH, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { AssetBUSD74E, AssetUSDTERC20Testnet } from '../../../const'
import { BNB_DECIMAL, THORCHAIN_DECIMAL } from '../../../helpers/assetHelper'
import { eqBaseAmount, eqODepositAssetFees, eqODepositFees } from '../../../helpers/fp/eq'
import { DepositAssetFees, DepositFees, SymDepositFees, SymDepositFeesRD } from '../../../services/chain/types'
import {
  getAssetAmountToDeposit,
  getRuneAmountToDeposit,
  maxAssetAmountToDeposit,
  maxRuneAmountToDeposit,
  getAssetChainFee,
  getThorchainFees,
  minBalanceToDeposit,
  minAssetAmountToDepositMax1e8,
  minRuneAmountToDeposit,
  getZeroSymDepositFees
} from './Deposit.helper'

describe('deposit/Deposit.helper', () => {
  // pool balances
  const poolData: PoolData = {
    runeBalance: baseAmount(200000), //  1 RUNE == 0.5 ASSET
    assetBalance: baseAmount(100000) //  1 ASSET == 2 RUNE
  }
  // user balances
  const runeBalance = baseAmount(1000)
  const assetBalance = { asset: AssetBNB, amount: baseAmount(2000) }
  const mockFees = getZeroSymDepositFees(AssetBNB)
  const fees: SymDepositFees = {
    ...mockFees,
    rune: {
      ...mockFees.rune,
      inFee: baseAmount(100)
    },
    asset: {
      ...mockFees.asset,
      inFee: baseAmount(200)
    }
  }

  describe('maxRuneAmountToDeposit', () => {
    it('900', () => {
      const result = maxRuneAmountToDeposit({ poolData, assetBalance, runeBalance, fees })
      // R = 200000 (rune pool)
      // A = 100000 (asset pool)
      // r = 1000 (rune balance)
      // rf = 100 (rune fee)
      // mrb = a - af (max rune balance = rune balance - rune fee)
      // mrb = 1000 - 100 = 900
      // a = 2000 (asset balance)
      // af = 200 (asset fee)
      // mab = a - af (max asset balance = asset balance - asset fee)
      // mab = 2000 - 200 = 1800
      // max = R / A * mab
      // max = 200000 / 100000 * 1800 = 3600
      // max > mrb ? mrb : max
      // 3600 >  900 ? 900 : 3600
      expect(eqBaseAmount.equals(result, baseAmount(900))).toBeTruthy()
    })
    it('4900', () => {
      const runeBalance = baseAmount(5000)
      const assetBalance = { asset: AssetBNB, amount: baseAmount(10000) }
      const result = maxRuneAmountToDeposit({ poolData, assetBalance, runeBalance, fees })
      // R = 200000 (rune pool)
      // A = 100000 (asset pool)
      // r = 5000 (rune balance)
      // rf = 100 (rune fee)
      // mrb = a - af (max rune balance = rune balance - rune fee)
      // mrb = 5000 - 100 = 4900
      // a = 2000 (asset balance)
      // af = 200 (asset fee)
      // mab = a - af (max asset balance = asset balance - asset fee)
      // mab = 10000 - 200 = 9800
      // max = R / A * mab
      // max = 200000 / 100000 * 9800 = 19600
      // max > mrb ? mrb : max
      // 19600 >  4900 ? 4900 : 19600
      expect(eqBaseAmount.equals(result, baseAmount(4900))).toBeTruthy()
    })
  })

  describe('maxAssetAmountToDeposit', () => {
    it('gas asset -> 450', () => {
      const result = maxAssetAmountToDeposit({ poolData, assetBalance, runeBalance, fees })
      // R = 200000 (rune pool)
      // A = 100000 (asset pool)
      // r = 1000 (rune balance)
      // rf = 100 (rune fee)
      // mrb = a - af (max rune balance = rune balance - rune fee)
      // mrb = 1000 - 100 = 900
      // a = 2000 (asset balance)
      // af = 200 (asset fee)
      // mab = a - af (max asset balance = asset balance - asset fee)
      // mab = 2000 - 200 = 1800
      // max = A / R * mrb
      // max = 100000 / 200000 * 900 = 450
      // max > mab ? mab : max
      // 450 > 1800 ? 1800 : 450
      expect(eqBaseAmount.equals(result, baseAmount(450))).toBeTruthy()
    })
    it('gas asset -> 9800', () => {
      const runeBalance = baseAmount(20000)
      const assetBalance = { asset: AssetBNB, amount: baseAmount(10000) }
      const result = maxAssetAmountToDeposit({ poolData, assetBalance, runeBalance, fees })
      // R = 200000 (rune pool)
      // A = 100000 (asset pool)
      // r = 20000 (rune balance)
      // rf = 100 (rune fee)
      // mrb = a - af (max rune balance = rune balance - rune fee)
      // mrb = 20000 - 100 = 19800
      // a = 10000 (asset balance)
      // af = 200 (asset fee)
      // mab = a - af (max asset balance = asset balance - asset fee)
      // mab = 10000 - 200 = 9800
      // max = A / R * mrb
      // max = 100000 / 200000 * 19800 = 9900
      // max > mab ? mab : max
      // 9900 > 9800 ? 9800 : 9900
      expect(eqBaseAmount.equals(result, baseAmount(9800))).toBeTruthy()
    })
    it('non gas asset -> 9950', () => {
      const runeBalance = baseAmount(20000)
      const assetBalance = { asset: AssetBUSD74E, amount: baseAmount(10000) }
      const result = maxAssetAmountToDeposit({ poolData, assetBalance, runeBalance, fees })
      console.log('result', result.amount().toString())
      // R = 200000 (rune pool)
      // A = 100000 (asset pool)
      // r = 20000 (rune balance)
      // rf = 100 (rune fee)
      // mrb = a - af (max rune balance = rune balance - rune fee)
      // mrb = 20000 - 100 = 19900
      // a = 10000 (asset balance)
      // mab = a (non gas asset - no fee deduction)
      // mab = 10000
      // max = A / R * mrb
      // max = 100000 / 200000 * 19900 = 9950
      // max > mab ? mab : max
      // 9950 > 10000 ? 10000 : 9950
      expect(eqBaseAmount.equals(result, baseAmount(9950))).toBeTruthy()
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

  describe('minBalanceToDeposit', () => {
    it('returns min. balance to cover deposit', () => {
      const fees = {
        inFee: baseAmount(100),
        refundFee: baseAmount(300)
      }
      const result = minBalanceToDeposit(fees)
      expect(eqBaseAmount.equals(result, baseAmount(600))).toBeTruthy()
    })
  })

  describe('minAssetAmountToDepositMax1e8', () => {
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

    it(`UTXO assets' min amount should be over estimated with 10k Sats`, () => {
      const params = {
        fees: {
          asset: AssetBTC,
          inFee: assetToBase(assetAmount(0.0001, BTC_DECIMAL)),
          outFee: assetToBase(assetAmount(0.0003, BTC_DECIMAL)),
          refundFee: assetToBase(assetAmount(0.0003, BTC_DECIMAL))
        },
        asset: AssetBTC,
        assetDecimal: BTC_DECIMAL,
        poolsData
      }

      // Prices
      // All in BTC

      // Formula (success):
      // inboundFeeInBTC + outboundFeeInBTC
      // 0.0001 + 0.0003 = 0.0004
      //
      // Formula (failure):
      // inboundFeeInBTC + refundFeeInBTC
      // 0.0001 + 0.0003 = 0.0004
      //
      // Formula (minValue):
      // 1,5 * max(success, failure)
      // 1,5 * max(0.0004, 0.0004) = 1,5 * 0.0004 = 0.0006
      // AND as this is UTXO asset overestimate with 10k Satoshis => 0.0006 + 10k Satoshis = 0.0007

      const result = minAssetAmountToDepositMax1e8(params)

      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(0.0007, BTC_DECIMAL)))).toBeTruthy()
    })

    it('deposit chain asset (BNB.BNB)', () => {
      const params = {
        fees: {
          asset: AssetBNB,
          inFee: assetToBase(assetAmount(0.0001, BNB_DECIMAL)),
          outFee: assetToBase(assetAmount(0.0003, BNB_DECIMAL)),
          refundFee: assetToBase(assetAmount(0.0003, BNB_DECIMAL))
        },
        asset: AssetBNB,
        assetDecimal: BNB_DECIMAL,
        poolsData
      }

      // Prices
      // All in BNB

      // Formula (success):
      // inboundFeeInBNB + outboundFeeInBNB
      // 0.0001 + 0.0003 = 0.0004
      //
      // Formula (failure):
      // inboundFeeInBNB + refundFeeInBNB
      // 0.0001 + 0.0003 = 0.0004
      //
      // Formula (minValue):
      // 1,5 * max(success, failure)
      // 1,5 * max(0.0004, 0.0004) = 1,5 * 0.0004 = 0.0006

      const result = minAssetAmountToDepositMax1e8(params)
      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(0.0006, BNB_DECIMAL)))).toBeTruthy()
    })

    it('deposit non chain asset (BNB.USD)', () => {
      const depositAssetDecimal = 8
      const params = {
        fees: {
          asset: AssetBNB,
          inFee: assetToBase(assetAmount(0.0001, BNB_DECIMAL)),
          outFee: assetToBase(assetAmount(0.0003, BNB_DECIMAL)),
          refundFee: assetToBase(assetAmount(0.0003, BNB_DECIMAL))
        },
        asset: AssetBUSD74E,
        assetDecimal: depositAssetDecimal,
        poolsData
      }

      // Prices
      // 1 BNB = 600 BUSD or 1 BUSD = 0,001666667 BNB
      //
      // Formula (success):
      // inboundFeeInBUSD + outboundFeeInBUSD
      // 0.0001 * 600 + 0.0003 * 600 = 0.06 + 0,18 = 0.24
      //
      // Formula (failure):
      // inboundFeeInBUSD + refundFeeInBUSD
      // 0.0001 * 600 + 0.0003 * 600 = 0.06 + 0,18 = 0.24
      //
      // Formula (minValue):
      // 1,5 * max(success, failure)
      // 1,5 * max(0.24, 0.24) = 1,5 * 0.24 = 0.36

      const result = minAssetAmountToDepositMax1e8(params)
      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(0.36, depositAssetDecimal)))).toBeTruthy()
    })

    it('deposit ERC20 token asset (ETH.USDT)', () => {
      const depositAssetDecimal = 7
      const params = {
        fees: {
          asset: AssetETH,
          inFee: assetToBase(assetAmount(0.01, ETH_DECIMAL)),
          outFee: assetToBase(assetAmount(0.03, ETH_DECIMAL)),
          refundFee: assetToBase(assetAmount(0.03, ETH_DECIMAL))
        },
        asset: AssetUSDTERC20Testnet,
        assetDecimal: depositAssetDecimal,
        poolsData
      }

      // Prices
      // 1 ETH = 2000 USDT or 1 USDT = 0,0005 ETH
      //
      // Formula (success):
      // inboundFeeInUSDT + outboundFeeInUSDT
      // 0.01 * 2000 + 0.03 * 2000 = 20 + 60 = 80
      //
      // Formula (failure):
      // inboundFeeInUSDT + refundFeeInUSDT
      // 0.01 * 2000 + 0.03 * 2000 = 20 + 60 = 80
      //
      // Formula (minValue):
      // 1,5 * max(success, failure)
      // 1,5 * max(80, 80) = 1,5 * 80 = 120

      const result = minAssetAmountToDepositMax1e8(params)
      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(120, depositAssetDecimal)))).toBeTruthy()
    })
  })

  describe('minRuneAmountToDeposit', () => {
    it('deposit RUNE', () => {
      const fees: DepositFees = {
        inFee: assetToBase(assetAmount(0.02, THORCHAIN_DECIMAL)),
        outFee: assetToBase(assetAmount(0.06, THORCHAIN_DECIMAL)),
        refundFee: assetToBase(assetAmount(0.06, THORCHAIN_DECIMAL))
      }

      // Prices
      // All in RUNE

      // Formula (success):
      // inboundFeeInRUNE + outboundFeeInRUNE
      // 0.02 + 0.06 = 0.08
      //
      // Formula (failure):
      // inboundFeeInRUNE + refundFeeInRUNE
      // 0.02 + 0.06 = 0.08
      //
      // Formula (minValue):
      // 1,5 * max(success, failure)
      // 1,5 * max(0.08, 0.08) = 1,5 * 0.08 = 0.12

      const result = minRuneAmountToDeposit(fees)
      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(0.12, THORCHAIN_DECIMAL)))).toBeTruthy()
    })
  })
})
