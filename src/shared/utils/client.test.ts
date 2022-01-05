import { Network } from '@xchainjs/xchain-client'

import { toClientNetwork } from './client'

describe('services/utils/', () => {
  describe('getClientNetwork', () => {
    it('for testnet', () => {
      expect(toClientNetwork('testnet')).toEqual(Network.Testnet)
    })
    it('for stagenet', () => {
      expect(toClientNetwork('stagenet')).toEqual(Network.Stagenet)
    })
    it('for mainnent', () => {
      expect(toClientNetwork('mainnet')).toEqual(Network.Mainnet)
    })
  })
})
