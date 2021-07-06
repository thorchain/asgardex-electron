import * as RD from '@devexperts/remote-data-ts'
import { Client } from '@xchainjs/xchain-binance'

import { ClientState } from '../clients/types'
import { getClientStateForViews, toClientNetwork } from './utils'

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

  describe('getClientStateForViews (Binance)', () => {
    it('returns true if a client has been created', () => {
      const state: ClientState<Client> = RD.success(mockClient)
      const result = getClientStateForViews<Client>(state)
      expect(result).toEqual('ready')
    })
    it('returns false if no client has been created', () => {
      const result = getClientStateForViews<Client>(RD.initial)
      expect(result).toEqual('notready')
    })
    it('returns false if any errors occur', () => {
      const state: ClientState<Client> = RD.failure(Error('any error'))
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
