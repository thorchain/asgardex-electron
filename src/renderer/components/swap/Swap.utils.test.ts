import { PoolData } from '@thorchain/asgardex-util'
import { assetToString, baseAmount, bn } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import { isRuneSwap, getSlip, getSwapResult, getSwapData, pickAssetWithPrice } from './Swap.utils'

describe('components/swap/utils', () => {
  describe('isRuneSwap', () => {
    it('should return none if no RUNE asset', () => {
      expect(isRuneSwap(ASSETS_TESTNET.BOLT, ASSETS_TESTNET.BNB)).toBeNone()
    })

    it('should return some(true) if target asset is RUNE', () => {
      expect(isRuneSwap(ASSETS_TESTNET.BOLT, ASSETS_TESTNET.RUNE)).toEqual(O.some(true))
    })

    it('should return some(false) if source asset is RUNE', () => {
      expect(isRuneSwap(ASSETS_TESTNET.RUNE, ASSETS_TESTNET.BOLT)).toEqual(O.some(false))
    })
  })

  describe('getSlip', () => {
    const poolsData: Record<string, PoolData> = {
      [assetToString(ASSETS_TESTNET.BNB)]: {
        assetBalance: baseAmount(1),
        runeBalance: baseAmount(2)
      },
      [assetToString(ASSETS_TESTNET.RUNE)]: {
        assetBalance: baseAmount(3),
        runeBalance: baseAmount(4)
      },
      [assetToString(ASSETS_TESTNET.BOLT)]: {
        assetBalance: baseAmount(5),
        runeBalance: baseAmount(6)
      }
    }

    it('should return zero result if no poolData', () => {
      expect(getSlip(ASSETS_TESTNET.BNB, ASSETS_TESTNET.BOLT, baseAmount(bn(123)), {})).toEqual(bn(0))
      expect(getSlip(ASSETS_TESTNET.RUNE, ASSETS_TESTNET.BOLT, baseAmount(bn(123)), {})).toEqual(bn(0))
      expect(getSlip(ASSETS_TESTNET.BNB, ASSETS_TESTNET.RUNE, baseAmount(bn(123)), {})).toEqual(bn(0))
    })

    it('should calculate slip when data enabled', () => {
      expect(getSlip(ASSETS_TESTNET.BNB, ASSETS_TESTNET.BOLT, baseAmount(bn(1)), poolsData)).toEqual(
        bn('0.64285714285714285714')
      )

      expect(getSlip(ASSETS_TESTNET.BOLT, ASSETS_TESTNET.BNB, baseAmount(bn(1)), poolsData)).toEqual(bn('0.5'))

      expect(getSlip(ASSETS_TESTNET.RUNE, ASSETS_TESTNET.BNB, baseAmount(bn(1)), poolsData)).toEqual(
        bn('0.33333333333333333333')
      )

      expect(getSlip(ASSETS_TESTNET.BNB, ASSETS_TESTNET.RUNE, baseAmount(bn(1)), poolsData)).toEqual(bn('0.25'))
    })
  })

  describe('getSwapResult', () => {
    it('should return zero result if no poolData', () => {
      expect(getSwapResult(ASSETS_TESTNET.BNB, ASSETS_TESTNET.BOLT, baseAmount(bn(123)), {})).toEqual(bn(0))
      expect(getSwapResult(ASSETS_TESTNET.RUNE, ASSETS_TESTNET.BOLT, baseAmount(bn(123)), {})).toEqual(bn(0))
      expect(getSwapResult(ASSETS_TESTNET.BNB, ASSETS_TESTNET.RUNE, baseAmount(bn(123)), {})).toEqual(bn(0))
    })

    it('should calculate swap output when data enabled', () => {
      const poolsData: Record<string, PoolData> = {
        [assetToString(ASSETS_TESTNET.BNB)]: {
          assetBalance: baseAmount(1),
          runeBalance: baseAmount(2)
        },
        [assetToString(ASSETS_TESTNET.BOLT)]: {
          assetBalance: baseAmount(50000000),
          runeBalance: baseAmount(1)
        },
        [assetToString(ASSETS_TESTNET.RUNE)]: {
          assetBalance: baseAmount(30),
          runeBalance: baseAmount(40000000000000)
        },
        [assetToString(ASSETS_TESTNET.FTM)]: {
          assetBalance: baseAmount(300000),
          runeBalance: baseAmount(40000000000000)
        }
      }

      expect(getSwapResult(ASSETS_TESTNET.BNB, ASSETS_TESTNET.BOLT, baseAmount(bn(1)), poolsData)).toEqual(bn('0.125'))

      expect(getSwapResult(ASSETS_TESTNET.RUNE, ASSETS_TESTNET.BOLT, baseAmount(bn(1)), poolsData)).toEqual(bn('0.125'))

      expect(getSwapResult(ASSETS_TESTNET.FTM, ASSETS_TESTNET.RUNE, baseAmount(bn(1)), poolsData)).toEqual(
        bn('1.33332444')
      )
    })
  })

  describe('getSwapData', () => {
    const defaultValue = {
      slip: bn(0),
      swapResult: bn(0)
    }
    it('should return default value', () => {
      expect(getSwapData(bn(1), O.none, O.none, {})).toEqual(defaultValue)
      expect(getSwapData(bn(1), O.some(ASSETS_TESTNET.FTM), O.none, {})).toEqual(defaultValue)
      expect(getSwapData(bn(1), O.none, O.some(ASSETS_TESTNET.FTM), {})).toEqual(defaultValue)
    })

    it('should calculate swap data', () => {
      const poolsData: Record<string, PoolData> = {
        [assetToString(ASSETS_TESTNET.BNB)]: {
          assetBalance: baseAmount(3000000),
          runeBalance: baseAmount(4000000)
        },
        [assetToString(ASSETS_TESTNET.RUNE)]: {
          assetBalance: baseAmount(3000000),
          runeBalance: baseAmount(4000000)
        }
      }

      expect(getSwapData(bn(0.0001), O.some(ASSETS_TESTNET.BNB), O.some(ASSETS_TESTNET.RUNE), poolsData)).toEqual({
        slip: bn('0.00332225913621262458'),
        swapResult: bn('0.00013245')
      })
    })
  })

  describe('pickAssetWithPrice', () => {
    it('should be none', () => {
      expect(pickAssetWithPrice([], O.none)).toBeNone()
      expect(pickAssetWithPrice([], O.some(ASSETS_TESTNET.FTM))).toBeNone()
    })
    it('should return first element if nothing found', () => {
      expect(
        pickAssetWithPrice(
          [
            { asset: ASSETS_TESTNET.RUNE, priceRune: bn(0) },
            { asset: ASSETS_TESTNET.BOLT, priceRune: bn(0) }
          ],
          O.some(ASSETS_TESTNET.FTM)
        )
      ).toEqual(O.some({ asset: ASSETS_TESTNET.RUNE, priceRune: bn(0) }))
    })

    it('should pick asset', () => {
      expect(
        pickAssetWithPrice(
          [
            { asset: ASSETS_TESTNET.RUNE, priceRune: bn(0) },
            { asset: ASSETS_TESTNET.BOLT, priceRune: bn(0) },
            { asset: ASSETS_TESTNET.FTM, priceRune: bn(0) }
          ],
          O.some(ASSETS_TESTNET.FTM)
        )
      ).toEqual(O.some({ asset: ASSETS_TESTNET.FTM, priceRune: bn(0) }))
    })
  })
})
