import { BinanceClient, Balance } from '@thorchain/asgardex-binance'
import { assetToBase, assetAmount, PoolData, EMPTY_ASSET } from '@thorchain/asgardex-util'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { PoolAsset } from '../../views/pools/types'
import { PoolDetails } from '../midgard/types'
import { BinanceClientState } from './types'
import {
  hasBinanceClient,
  getBinanceClient,
  getBinanceClientStateForViews,
  bncSymbolToAsset,
  bncSymbolToAssetString,
  getPoolPriceValue
} from './utils'

// Mocking non default class exports
// https://jestjs.io/docs/en/es6-class-mocks#mocking-non-default-class-exports
jest.mock('@thorchain/asgardex-binance', () => {
  return {
    BinanceClient: jest.fn().mockImplementation(() =>
      /* return empty object - we don't need mock any functions in tests here */
      {}
    )
  }
})

describe('services/binance/utils/', () => {
  let mockClient: BinanceClient
  beforeEach(() => {
    BinanceClient.mockClear()
    mockClient = new BinanceClient()
  })

  describe('getBinanceClient', () => {
    it('returns a client if it has been created before', () => {
      const state: BinanceClientState = O.some(E.right(mockClient))
      const result = getBinanceClient(state)
      expect(O.toNullable(result)).toEqual(mockClient)
    })
    it('returns none if a client has not been created before', () => {
      const result = getBinanceClient(O.none)
      expect(result).toBeNone()
    })
    it('returns none if creating a client has throw an error before', () => {
      const state: BinanceClientState = O.some(E.left(new Error('any error')))
      const result = getBinanceClient(state)
      expect(result).toBeNone()
    })
  })

  describe('hasBinanceClient', () => {
    it('returns true if a client has been created', () => {
      const state: BinanceClientState = O.some(E.right(mockClient))
      const result = hasBinanceClient(state)
      expect(result).toBeTruthy()
    })
    it('returns false if no client has been created', () => {
      const result = hasBinanceClient(O.none)
      expect(result).toBeFalsy()
    })
    it('returns false if any errors occur', () => {
      const state: BinanceClientState = O.some(E.left(new Error('any error')))
      const result = hasBinanceClient(state)
      expect(result).toBeFalsy()
    })
  })

  describe('getBinanceClientStateForViews', () => {
    it('returns true if a client has been created', () => {
      const state: BinanceClientState = O.some(E.right(mockClient))
      const result = getBinanceClientStateForViews(state)
      expect(result).toEqual('ready')
    })
    it('returns false if no client has been created', () => {
      const result = getBinanceClientStateForViews(O.none)
      expect(result).toEqual('notready')
    })
    it('returns false if any errors occur', () => {
      const state: BinanceClientState = O.some(E.left(new Error('any error')))
      const result = getBinanceClientStateForViews(state)
      expect(result).toEqual('error')
    })
  })

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
        symbol: 'RUNE-A1A',
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
