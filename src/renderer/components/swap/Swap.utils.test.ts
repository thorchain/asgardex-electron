import { ETH_DECIMAL } from '@xchainjs/xchain-ethereum'
import {
  assetAmount,
  AssetBNB,
  AssetETH,
  AssetRuneNative,
  assetToBase,
  assetToString,
  baseAmount,
  bn
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import { AssetBUSD74E, AssetUSDTERC20, ZERO_BASE_AMOUNT } from '../../const'
import { BNB_DECIMAL } from '../../helpers/assetHelper'
import { eqBaseAmount } from '../../helpers/fp/eq'
import { PoolsDataMap } from '../../services/midgard/types'
import {
  DEFAULT_SWAP_DATA,
  isRuneSwap,
  getSlip,
  getSwapResult,
  getSwapData,
  pickPoolAsset,
  poolAssetDetailToAsset,
  minBalanceToSwap,
  calcRefundFee,
  minAmountToSwapMax1e8
} from './Swap.utils'

describe('components/swap/utils', () => {
  describe('isRuneSwap', () => {
    it('should return none if no RUNE asset', () => {
      expect(isRuneSwap(ASSETS_TESTNET.BOLT, AssetBNB)).toBeNone()
    })

    it('should return some(true) if target asset is RUNE', () => {
      expect(isRuneSwap(ASSETS_TESTNET.BOLT, AssetRuneNative)).toEqual(O.some(true))
    })

    it('should return some(false) if source asset is RUNE', () => {
      expect(isRuneSwap(AssetRuneNative, ASSETS_TESTNET.BOLT)).toEqual(O.some(false))
    })
  })

  describe('getSlip', () => {
    const poolsData: PoolsDataMap = {
      [assetToString(AssetBNB)]: {
        assetBalance: baseAmount(1),
        runeBalance: baseAmount(2)
      },
      [assetToString(AssetRuneNative)]: {
        assetBalance: baseAmount(3),
        runeBalance: baseAmount(4)
      },
      [assetToString(ASSETS_TESTNET.BOLT)]: {
        assetBalance: baseAmount(5),
        runeBalance: baseAmount(6)
      }
    }

    it('should return zero result if no poolData', () => {
      expect(
        getSlip({
          sourceAsset: AssetBNB,
          targetAsset: ASSETS_TESTNET.BOLT,
          amountToSwap: baseAmount(bn(123)),
          poolsData: {}
        })
      ).toEqual(bn(0))
      expect(
        getSlip({
          sourceAsset: AssetRuneNative,
          targetAsset: ASSETS_TESTNET.BOLT,
          amountToSwap: baseAmount(bn(123)),
          poolsData: {}
        })
      ).toEqual(bn(0))
      expect(
        getSlip({
          sourceAsset: AssetBNB,
          targetAsset: AssetRuneNative,
          amountToSwap: baseAmount(bn(123)),
          poolsData: {}
        })
      ).toEqual(bn(0))
    })

    it('should calculate slip when data enabled', () => {
      expect(
        getSlip({
          sourceAsset: AssetBNB,
          targetAsset: ASSETS_TESTNET.BOLT,
          amountToSwap: baseAmount(bn(1)),
          poolsData
        })
      ).toEqual(bn('0.64285714285714285714'))

      expect(
        getSlip({
          sourceAsset: ASSETS_TESTNET.BOLT,
          targetAsset: AssetBNB,
          amountToSwap: baseAmount(bn(1)),
          poolsData
        })
      ).toEqual(bn('0.5'))

      expect(
        getSlip({
          sourceAsset: AssetRuneNative,
          targetAsset: AssetBNB,
          amountToSwap: baseAmount(bn(1)),
          poolsData
        })
      ).toEqual(bn('0.33333333333333333333'))

      expect(
        getSlip({
          sourceAsset: AssetBNB,
          targetAsset: AssetRuneNative,
          amountToSwap: baseAmount(bn(1)),
          poolsData
        })
      ).toEqual(bn('0.25'))
    })
  })

  describe('getSwapResult', () => {
    it('should return zero result if no poolData', () => {
      expect(
        eqBaseAmount.equals(
          getSwapResult({
            sourceAsset: AssetBNB,
            targetAsset: ASSETS_TESTNET.BOLT,
            amountToSwap: baseAmount(123),
            poolsData: {}
          }),
          ZERO_BASE_AMOUNT
        )
      ).toBeTruthy()

      expect(
        eqBaseAmount.equals(
          getSwapResult({
            sourceAsset: AssetRuneNative,
            targetAsset: ASSETS_TESTNET.BOLT,
            amountToSwap: baseAmount(123),
            poolsData: {}
          }),
          ZERO_BASE_AMOUNT
        )
      ).toBeTruthy()

      expect(
        eqBaseAmount.equals(
          getSwapResult({
            sourceAsset: AssetBNB,
            targetAsset: AssetRuneNative,
            amountToSwap: baseAmount(123),
            poolsData: {}
          }),
          ZERO_BASE_AMOUNT
        )
      ).toBeTruthy()
    })

    it('should calculate swap output when data enabled', () => {
      const poolsData: PoolsDataMap = {
        [assetToString(AssetBNB)]: {
          assetBalance: baseAmount(1),
          runeBalance: baseAmount(2)
        },
        [assetToString(ASSETS_TESTNET.BOLT)]: {
          assetBalance: baseAmount(50000000),
          runeBalance: baseAmount(1)
        },
        [assetToString(AssetRuneNative)]: {
          assetBalance: baseAmount(30),
          runeBalance: baseAmount(40000000000000)
        },
        [assetToString(ASSETS_TESTNET.FTM)]: {
          assetBalance: baseAmount(300000),
          runeBalance: baseAmount(40000000000000)
        }
      }

      expect(
        eqBaseAmount.equals(
          getSwapResult({
            sourceAsset: AssetBNB,
            targetAsset: ASSETS_TESTNET.BOLT,
            amountToSwap: baseAmount(1),
            poolsData
          }),
          assetToBase(assetAmount('0.125'))
        )
      ).toBeTruthy()

      expect(
        eqBaseAmount.equals(
          getSwapResult({
            sourceAsset: ASSETS_TESTNET.FTM,
            targetAsset: AssetRuneNative,
            amountToSwap: baseAmount(1),
            poolsData
          }),
          assetToBase(assetAmount('1.33332444'))
        )
      ).toBeTruthy()
    })
  })

  describe('getSwapData', () => {
    it('should return default value', () => {
      expect(
        getSwapData({ amountToSwap: baseAmount(123), sourceAsset: O.none, targetAsset: O.none, poolsData: {} })
      ).toEqual(DEFAULT_SWAP_DATA)
      expect(
        getSwapData({
          amountToSwap: baseAmount(123),
          sourceAsset: O.some(ASSETS_TESTNET.FTM),
          targetAsset: O.none,
          poolsData: {}
        })
      ).toEqual(DEFAULT_SWAP_DATA)
      expect(
        getSwapData({
          amountToSwap: baseAmount(123),
          sourceAsset: O.none,
          targetAsset: O.some(ASSETS_TESTNET.FTM),
          poolsData: {}
        })
      ).toEqual(DEFAULT_SWAP_DATA)
    })

    it('should calculate swap data', () => {
      const poolsData: PoolsDataMap = {
        [assetToString(AssetBNB)]: {
          assetBalance: baseAmount(3000000),
          runeBalance: baseAmount(4000000)
        },
        [assetToString(AssetRuneNative)]: {
          assetBalance: baseAmount(3000000),
          runeBalance: baseAmount(4000000)
        }
      }

      const { slip, swapResult } = getSwapData({
        amountToSwap: assetToBase(assetAmount(0.0001)),
        sourceAsset: O.some(AssetBNB),
        targetAsset: O.some(AssetRuneNative),
        poolsData
      })

      expect(slip.isEqualTo(bn('0.00332225913621262458'))).toBeTruthy()
      expect(eqBaseAmount.equals(swapResult, baseAmount('13245'))).toBeTruthy()
    })
  })

  describe('pickPoolAsset', () => {
    it('should be none', () => {
      expect(pickPoolAsset([], AssetBNB)).toBeNone()
    })
    it('should return first element if nothing found', () => {
      expect(
        pickPoolAsset(
          [
            { asset: AssetRuneNative, assetPrice: bn(0) },
            { asset: AssetBNB, assetPrice: bn(1) }
          ],
          ASSETS_TESTNET.FTM
        )
      ).toEqual(O.some({ asset: AssetRuneNative, assetPrice: bn(0) }))
    })

    it('should pick asset', () => {
      expect(
        pickPoolAsset(
          [
            { asset: AssetRuneNative, assetPrice: bn(0) },
            { asset: AssetBNB, assetPrice: bn(1) },
            { asset: AssetETH, assetPrice: bn(2) }
          ],
          AssetETH
        )
      ).toEqual(O.some({ asset: AssetETH, assetPrice: bn(2) }))
    })
  })

  describe('poolAssetToAsset', () => {
    it('returns none', () => {
      expect(poolAssetDetailToAsset(O.none)).toBeNone()
    })
    it('returns AssetRuneNative', () => {
      expect(poolAssetDetailToAsset(O.some({ asset: AssetRuneNative, assetPrice: bn(0) }))).toEqual(
        O.some(AssetRuneNative)
      )
    })
  })

  describe('calcRefundFee', () => {
    it('should be 3 x inbound fee', () => {
      const result = calcRefundFee(baseAmount(2))
      expect(eqBaseAmount.equals(result, baseAmount(6))).toBeTruthy()
    })
  })

  describe('minBalanceToSwap', () => {
    it('returns min. amount to cover inbound + refund fees', () => {
      const params = {
        inFee: {
          amount: baseAmount(100),
          asset: AssetBNB
        }
      }
      const result = minBalanceToSwap(params)
      expect(eqBaseAmount.equals(result, baseAmount(600))).toBeTruthy()
    })
  })

  describe('minAmountToSwapMax1e8', () => {
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

    it('non chain asset -> chain asset (same chain): BNB.USD -> BNB.BNB)', () => {
      const inAssetDecimal = 6
      const params = {
        swapFees: {
          inFee: {
            amount: assetToBase(assetAmount(0.0001, BNB_DECIMAL)),
            asset: AssetBNB
          },
          outFee: {
            amount: assetToBase(assetAmount(0.0003, BNB_DECIMAL)),
            asset: AssetBNB
          }
        },
        inAsset: AssetBUSD74E,
        inAssetDecimal,
        outAsset: AssetBNB,
        poolsData
      }
      // Prices
      // 1 BNB = 600 BUSD or 1 BUSD = 0,001666667 BNB
      // Formula:
      // 1.5 * (inboundFeeInBUSD + outboundFeeInBUSD)
      // = 1.5 * (0.0001 * 600 + 0.0003 * 600)
      // = 1.5 * (0.06 + 0,18) = 1.5 * 0.24
      // = 0.36

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

      const result = minAmountToSwapMax1e8(params)
      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(0.36, inAssetDecimal)))).toBeTruthy()
    })

    it('chain asset -> non chain asset (same chain): BNB.BNB -> BNB.USD', () => {
      const inAssetDecimal = BNB_DECIMAL
      const params = {
        swapFees: {
          inFee: {
            amount: assetToBase(assetAmount(0.0001)),
            asset: AssetBNB
          },
          outFee: {
            amount: assetToBase(assetAmount(0.0003)),
            asset: AssetBNB
          }
        },
        inAsset: AssetBNB,
        inAssetDecimal,
        outAsset: AssetBUSD74E,
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

      const result = minAmountToSwapMax1e8(params)
      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(0.0006, inAssetDecimal)))).toBeTruthy()
    })

    it('chain asset -> chain asset (same chains): ETH.USDT -> ETH.ETH', () => {
      const inAssetDecimal = 7
      const params = {
        swapFees: {
          inFee: {
            amount: assetToBase(assetAmount(0.01, ETH_DECIMAL)),
            asset: AssetETH
          },
          outFee: {
            amount: assetToBase(assetAmount(0.03, ETH_DECIMAL)),
            asset: AssetETH
          }
        },
        inAsset: AssetUSDTERC20,
        inAssetDecimal,
        outAsset: AssetETH,
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

      const result = minAmountToSwapMax1e8(params)
      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(120, inAssetDecimal)))).toBeTruthy()
    })

    it('chain asset -> chain asset (different chains): BNB.BNB -> ETH.ETH', () => {
      const inAssetDecimal = BNB_DECIMAL
      const params = {
        swapFees: {
          inFee: {
            amount: assetToBase(assetAmount(0.0001)),
            asset: AssetBNB
          },
          outFee: {
            amount: assetToBase(assetAmount(0.01)),
            asset: AssetETH
          }
        },
        inAsset: AssetBNB,
        inAssetDecimal,
        outAsset: AssetETH,
        poolsData
      }
      // Prices
      // 1 BNB = 0.3 ETH or 1 ETH = 3.33 BNB
      //
      // Formula (success):
      // inboundFeeInBNB + outboundFeeInBNB
      // 0.0001 + (0.01 * 3.33) = 0.0001 + 0,0333 = 0.0334
      //
      // Formula (failure):
      // inboundFeeInBNB + refundFeeInBNB
      // 0.0001 + (0.0003 * 3.33) = 0.0001 + 0,000999 = 0.001099
      //
      // Formula (minValue):
      // 1,5 * max(success, failure)
      // 1,5 * max(0.03343, 0.001099) = 1,5 * 0.03343 = 0.0501

      const result = minAmountToSwapMax1e8(params)
      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(0.05015, inAssetDecimal)))).toBeTruthy()
    })

    it('non chain asset -> non chain asset (different chains): BNB.BUSD -> ETH.USDT', () => {
      const inAssetDecimal = 7
      const params = {
        swapFees: {
          inFee: {
            amount: assetToBase(assetAmount(0.0001)),
            asset: AssetBNB
          },
          outFee: {
            amount: assetToBase(assetAmount(0.01)),
            asset: AssetETH
          }
        },
        inAsset: AssetBUSD74E,
        inAssetDecimal,
        outAsset: AssetUSDTERC20,
        poolsData
      }

      // Prices
      // 1 ETH = 2000 USD or 1 USD = 0,0005 ETH
      // 1 BNB = 600 USD or 1 USD = 0,001666667 BNB
      //
      // Formula (success):
      // outboundFeeInBUSD
      // (0.01 * 2000) = 20
      //
      // Formula (failure):
      // refundFeeInBUSD
      // 0.0003 * 600 = 0.18
      //
      // Formula (minValue):
      // 1,5 * max(success, failure)
      // 1,5 * max(10, 18) = 1,5 * 20 = 30

      const result = minAmountToSwapMax1e8(params)
      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(30, inAssetDecimal)))).toBeTruthy()
    })
  })
})
