import { PoolData } from '@thorchain/asgardex-util'
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
import { ZERO_BASE_AMOUNT } from '../../const'
import { eqBaseAmount } from '../../helpers/fp/eq'
import { DEFAULT_SWAP_DATA, isRuneSwap, getSlip, getSwapResult, getSwapData, pickAssetWithPrice } from './Swap.utils'

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
    const poolsData: Record<string, PoolData> = {
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
      expect(getSlip(AssetBNB, ASSETS_TESTNET.BOLT, baseAmount(bn(123)), {})).toEqual(bn(0))
      expect(getSlip(AssetRuneNative, ASSETS_TESTNET.BOLT, baseAmount(bn(123)), {})).toEqual(bn(0))
      expect(getSlip(AssetBNB, AssetRuneNative, baseAmount(bn(123)), {})).toEqual(bn(0))
    })

    it('should calculate slip when data enabled', () => {
      expect(getSlip(AssetBNB, ASSETS_TESTNET.BOLT, baseAmount(bn(1)), poolsData)).toEqual(bn('0.64285714285714285714'))

      expect(getSlip(ASSETS_TESTNET.BOLT, AssetBNB, baseAmount(bn(1)), poolsData)).toEqual(bn('0.5'))

      expect(getSlip(AssetRuneNative, AssetBNB, baseAmount(bn(1)), poolsData)).toEqual(bn('0.33333333333333333333'))

      expect(getSlip(AssetBNB, AssetRuneNative, baseAmount(bn(1)), poolsData)).toEqual(bn('0.25'))
    })
  })

  describe('getSwapResult', () => {
    it('should return zero result if no poolData', () => {
      expect(
        eqBaseAmount.equals(getSwapResult(AssetBNB, ASSETS_TESTNET.BOLT, baseAmount(123), {}), ZERO_BASE_AMOUNT)
      ).toBeTruthy()

      expect(
        eqBaseAmount.equals(getSwapResult(AssetRuneNative, ASSETS_TESTNET.BOLT, baseAmount(123), {}), ZERO_BASE_AMOUNT)
      ).toBeTruthy()

      expect(
        eqBaseAmount.equals(getSwapResult(AssetBNB, AssetRuneNative, baseAmount(123), {}), ZERO_BASE_AMOUNT)
      ).toBeTruthy()
    })

    it('should calculate swap output when data enabled', () => {
      const poolsData: Record<string, PoolData> = {
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
          getSwapResult(AssetBNB, ASSETS_TESTNET.BOLT, baseAmount(1), poolsData),
          assetToBase(assetAmount('0.125'))
        )
      ).toBeTruthy()

      expect(
        eqBaseAmount.equals(
          getSwapResult(ASSETS_TESTNET.FTM, AssetRuneNative, baseAmount(1), poolsData),
          assetToBase(assetAmount('1.33332444'))
        )
      ).toBeTruthy()
    })
  })

  describe('getSwapData', () => {
    it('should return default value', () => {
      expect(getSwapData(baseAmount(123), O.none, O.none, {})).toEqual(DEFAULT_SWAP_DATA)
      expect(getSwapData(baseAmount(123), O.some(ASSETS_TESTNET.FTM), O.none, {})).toEqual(DEFAULT_SWAP_DATA)
      expect(getSwapData(baseAmount(123), O.none, O.some(ASSETS_TESTNET.FTM), {})).toEqual(DEFAULT_SWAP_DATA)
    })

    it('should calculate swap data', () => {
      const poolsData: Record<string, PoolData> = {
        [assetToString(AssetBNB)]: {
          assetBalance: baseAmount(3000000),
          runeBalance: baseAmount(4000000)
        },
        [assetToString(AssetRuneNative)]: {
          assetBalance: baseAmount(3000000),
          runeBalance: baseAmount(4000000)
        }
      }

      const { slip, swapResult } = getSwapData(
        assetToBase(assetAmount(0.0001)),
        O.some(AssetBNB),
        O.some(AssetRuneNative),
        poolsData
      )

      expect(slip.isEqualTo(bn('0.00332225913621262458'))).toBeTruthy()
      expect(eqBaseAmount.equals(swapResult, baseAmount('13245'))).toBeTruthy()
    })
  })

  describe('pickAssetWithPrice', () => {
    it('should be none', () => {
      expect(pickAssetWithPrice([], AssetBNB)).toBeNone()
    })
    it('should return first element if nothing found', () => {
      expect(
        pickAssetWithPrice(
          [
            { asset: AssetRuneNative, priceRune: bn(0) },
            { asset: AssetBNB, priceRune: bn(1) }
          ],
          ASSETS_TESTNET.FTM
        )
      ).toEqual(O.some({ asset: AssetRuneNative, priceRune: bn(0) }))
    })

    it('should pick asset', () => {
      expect(
        pickAssetWithPrice(
          [
            { asset: AssetRuneNative, priceRune: bn(0) },
            { asset: AssetBNB, priceRune: bn(1) },
            { asset: AssetETH, priceRune: bn(2) }
          ],
          AssetETH
        )
      ).toEqual(O.some({ asset: AssetETH, priceRune: bn(2) }))
    })
  })
})
