import { BinanceClient } from '@thorchain/asgardex-binance'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'

import { ClientState } from './types'
import { getClient, hasClient, getClientStateForViews, chainIdToString } from './utils'

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

describe('services/utils/', () => {
  let mockClient: BinanceClient
  beforeEach(() => {
    BinanceClient.mockClear()
    mockClient = new BinanceClient()
  })

  describe('getClient (Binance)', () => {
    it('returns a client if it has been created before', () => {
      const state: ClientState<BinanceClient> = O.some(E.right(mockClient))
      const result = getClient(state)
      expect(O.toNullable(result)).toEqual(mockClient)
    })
    it('returns none if a client has not been created before', () => {
      const result = getClient(O.none)
      expect(result).toBeNone()
    })
    it('returns none if creating a client has throw an error before', () => {
      const state: ClientState<BinanceClient> = O.some(E.left(new Error('any error')))
      const result = getClient<BinanceClient>(state)
      expect(result).toBeNone()
    })
  })

  describe('hasClient (Binance)', () => {
    it('returns true if a client has been created', () => {
      const state: ClientState<BinanceClient> = O.some(E.right(mockClient))
      const result = hasClient(state)
      expect(result).toBeTruthy()
    })
    it('returns false if no client has been created', () => {
      const result = hasClient<BinanceClient>(O.none)
      expect(result).toBeFalsy()
    })
    it('returns false if any errors occur', () => {
      const state: ClientState<BinanceClient> = O.some(E.left(new Error('any error')))
      const result = hasClient(state)
      expect(result).toBeFalsy()
    })
  })

  describe('getClientStateForViews (Binance)', () => {
    it('returns true if a client has been created', () => {
      const state: ClientState<BinanceClient> = O.some(E.right(mockClient))
      const result = getClientStateForViews<BinanceClient>(state)
      expect(result).toEqual('ready')
    })
    it('returns false if no client has been created', () => {
      const result = getClientStateForViews<BinanceClient>(O.none)
      expect(result).toEqual('notready')
    })
    it('returns false if any errors occur', () => {
      const state: ClientState<BinanceClient> = O.some(E.left(new Error('any error')))
      const result = getClientStateForViews(state)
      expect(result).toEqual('error')
    })
  })

  describe('chainIdToString', () => {
    it('returns string for Thorchain', () => {
      expect(chainIdToString('Thorchain')).toEqual('Thorchain')
    })
    it('returns string for BTC', () => {
      expect(chainIdToString('BTC')).toEqual('Bitcoin')
    })
    it('returns string for ETH', () => {
      expect(chainIdToString('ETH')).toEqual('Ethereum')
    })
    it('returns string for BNB', () => {
      expect(chainIdToString('Binance')).toEqual('Binance Chain')
    })
  })
})
