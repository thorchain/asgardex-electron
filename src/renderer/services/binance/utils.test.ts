import { Balance } from '@thorchain/asgardex-binance'
import { assetToBase, assetAmount, PoolData, EMPTY_ASSET } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { PoolAsset } from '../../views/pools/types'
import { PoolDetails } from '../midgard/types'
import { bncSymbolToAsset, bncSymbolToAssetString, getPoolPriceValue } from './utils'

describe('services/binance/utils/', () => {
  describe('getPoolPriceValue', () => {
    const poolDetails: PoolDetails = [
      {
        asset: PoolAsset.BNB,
        assetDepth: '1000000000',
        runeDepth: '10000000000'
      }
    ]
    const usdPool: PoolData = {
      assetBalance: assetToBase(assetAmount(110000)),
      runeBalance: assetToBase(assetAmount(100000))
    }

    it('returns a price for BNB in USD', () => {
      const balance: Balance = {
        free: '1',
        symbol: 'BNB',
        locked: '',
        frozen: ''
      }
      const result = FP.pipe(
        getPoolPriceValue(balance, poolDetails, usdPool),
        O.fold(
          () => 'failure',
          (price) => price.amount().toString()
        )
      )
      expect(result).toEqual('1100000000')
    })

    it('returns a price for RUNE in USD', () => {
      const balance: Balance = {
        free: '1',
        symbol: 'RUNE-67C',
        locked: '',
        frozen: ''
      }
      const result = FP.pipe(
        getPoolPriceValue(balance, [], usdPool),
        O.fold(
          () => 'failure',
          (price) => price.amount().toString()
        )
      )
      expect(result).toEqual('110000000')
    })

    it('returns a no price if no pools are available', () => {
      const balance: Balance = {
        free: '1',
        symbol: 'BNB',
        locked: '',
        frozen: ''
      }
      const result = getPoolPriceValue(balance, [], usdPool)
      expect(result).toBeNone()
    })
  })

  describe('bncSymbolToAssetString', () => {
    it('creates a RUNE `Asset` as string', () => {
      const result = bncSymbolToAssetString('RUNE-B1A')
      expect(result).toEqual('BNB.RUNE-B1A')
    })
  })

  describe('bncSymbolToAsset', () => {
    it('creates a RUNE `Asset`', () => {
      const result = FP.pipe(
        bncSymbolToAsset('RUNE-B1A'),
        O.getOrElse(() => EMPTY_ASSET)
      )
      expect(result).toEqual({
        chain: 'BNB',
        symbol: 'RUNE-B1A',
        ticker: 'RUNE'
      })
    })
  })
})
