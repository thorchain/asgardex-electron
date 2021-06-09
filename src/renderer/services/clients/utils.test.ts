import { Client } from '@xchainjs/xchain-binance'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'

import { ClientState } from '../clients/types'
import { getClient, hasClient, getClientStateForViews, toClientNetwork } from './utils'

// Mocking non default class exports
// https://jestjs.io/docs/en/es6-class-mocks#mocking-non-default-class-exports
jest.mock('@xchainjs/xchain-binance', () => {
  return {
    Client: jest.fn().mockImplementation(() =>
      /* return empty object - we don't need mock any functions in tests here */
      {}
    )
  }
})

describe('services/utils/', () => {
  let mockClient: Client
  beforeEach(() => {
    mockClient = new Client({})
  })

  describe('getClient (Binance)', () => {
    it('returns a client if it has been created before', () => {
      const state: ClientState<Client> = O.some(E.right(mockClient))
      const result = getClient(state)
      expect(O.toNullable(result)).toEqual(mockClient)
    })
    it('returns none if a client has not been created before', () => {
      const result = getClient(O.none)
      expect(result).toBeNone()
    })
    it('returns none if creating a client has throw an error before', () => {
      const state: ClientState<Client> = O.some(E.left(new Error('any error')))
      const result = getClient<Client>(state)
      expect(result).toBeNone()
    })
  })

  describe('hasClient (Binance)', () => {
    it('returns true if a client has been created', () => {
      const state: ClientState<Client> = O.some(E.right(mockClient))
      const result = hasClient(state)
      expect(result).toBeTruthy()
    })
    it('returns false if no client has been created', () => {
      const result = hasClient<Client>(O.none)
      expect(result).toBeFalsy()
    })
    it('returns false if any errors occur', () => {
      const state: ClientState<Client> = O.some(E.left(new Error('any error')))
      const result = hasClient(state)
      expect(result).toBeFalsy()
    })
  })

  describe('getClientStateForViews (Binance)', () => {
    it('returns true if a client has been created', () => {
      const state: ClientState<Client> = O.some(E.right(mockClient))
      const result = getClientStateForViews<Client>(state)
      expect(result).toEqual('ready')
    })
    it('returns false if no client has been created', () => {
      const result = getClientStateForViews<Client>(O.none)
      expect(result).toEqual('notready')
    })
    it('returns false if any errors occur', () => {
      const state: ClientState<Client> = O.some(E.left(new Error('any error')))
      const result = getClientStateForViews(state)
      expect(result).toEqual('error')
    })
  })

  describe('getClientNetwork', () => {
    it('for testnet', () => {
      expect(toClientNetwork('testnet')).toEqual('testnet')
    })
    it('for mainnent', () => {
      expect(toClientNetwork('mainnet')).toEqual('mainnet')
    })
  })
})
