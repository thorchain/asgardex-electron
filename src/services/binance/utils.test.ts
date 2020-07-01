import { BinanceClient } from '@thorchain/asgardex-binance'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'

import { BinanceClientState } from './types'
import { hasBinanceClientState, getBinanceClientState, getBinanceClientStateForViews } from './utils'

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

  describe('getBinanceClientState', () => {
    it('returns a client if it has been created before', () => {
      const state: BinanceClientState = O.some(E.right(mockClient))
      const result = getBinanceClientState(state)
      expect(O.toNullable(result)).toEqual(mockClient)
    })
    it('returns none if a client has not been created before', () => {
      const result = getBinanceClientState(O.none)
      expect(result).toBeNone()
    })
    it('returns none if creating a client has throw an error before', () => {
      const state: BinanceClientState = O.some(E.left(new Error('any error')))
      const result = getBinanceClientState(state)
      expect(result).toBeNone()
    })
  })

  describe('hasBinanceClientState', () => {
    it('returns true if a client has been created', () => {
      const state: BinanceClientState = O.some(E.right(mockClient))
      const result = hasBinanceClientState(state)
      expect(result).toBeTruthy()
    })
    it('returns false if no client has been created', () => {
      const result = hasBinanceClientState(O.none)
      expect(result).toBeFalsy()
    })
    it('returns false if any errors occur', () => {
      const state: BinanceClientState = O.some(E.left(new Error('any error')))
      const result = hasBinanceClientState(state)
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
})
