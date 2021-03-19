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
import { PoolsDataMap } from '../../services/midgard/types'
import {
  DEFAULT_SWAP_DATA,
  isRuneSwap,
  getSlip,
  getSwapResult,
  getSwapData,
  pickPoolAsset,
  poolAssetDetailToAsset
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
})
