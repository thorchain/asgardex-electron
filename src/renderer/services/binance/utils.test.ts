import { Balances } from '@thorchain/asgardex-binance'
import { assetToBase, assetAmount, PoolData, EMPTY_ASSET, baseAmount, assetFromString } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { PoolAsset } from '../../views/pools/types'
import { PoolDetails } from '../midgard/types'
import { WalletBalance } from '../wallet/types'
import { bncSymbolToAsset, bncSymbolToAssetString, getPoolPriceValue, getWalletBalances } from './utils'

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
      const balance: WalletBalance = {
        amount: baseAmount('1'),
        asset: O.fromNullable(assetFromString('BNB.BNB'))
      }
      const result = FP.pipe(
        getPoolPriceValue(balance, poolDetails, usdPool),
        O.fold(
          () => 'failure',
          (price) => price.amount().toString()
        )
      )
      expect(result).toEqual('11')
    })

    it('returns a price for RUNE in USD', () => {
      const balance: WalletBalance = {
        amount: baseAmount('1'),
        asset: O.fromNullable(assetFromString('BNB.RUNE-67C'))
      }
      const result = FP.pipe(
        getPoolPriceValue(balance, [], usdPool),
        O.fold(
          () => 'failure',
          (price) => price.amount().toString()
        )
      )
      expect(result).toEqual('1')
    })

    it('returns a no price if no pools are available', () => {
      const balance: WalletBalance = {
        amount: baseAmount('1'),
        asset: O.fromNullable(assetFromString('BNB.BNB'))
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

  describe('getWalletBalances', () => {
    it('maps `Balances` -> `WalletBalances`', () => {
      const balances: Balances = [
        {
          free: '1',
          symbol: 'BNB',
          locked: '',
          frozen: ''
        },
        {
          free: '2',
          symbol: 'RUNE-B1A',
          locked: '',
          frozen: ''
        }
      ]

      const result = getWalletBalances(balances)
      expect(result[0].asset).toEqual(
        O.some({
          chain: 'BNB',
          symbol: 'BNB',
          ticker: 'BNB'
        })
      )

      expect(result[0].amount.amount()).toEqual(assetToBase(assetAmount(1)).amount())
      expect(result[1].asset).toEqual(
        O.some({
          chain: 'BNB',
          symbol: 'RUNE-B1A',
          ticker: 'RUNE'
        })
      )
      expect(result[1].amount.amount()).toEqual(assetToBase(assetAmount(2)).amount())
    })
  })
})
