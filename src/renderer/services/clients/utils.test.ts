import { toClientNetwork } from './utils'

describe('services/utils/', () => {
  describe('getClientNetwork', () => {
    it('for testnet', () => {
      expect(toClientNetwork('testnet')).toEqual('testnet')
    })
    it('for mainnent', () => {
      expect(toClientNetwork('mainnet')).toEqual('mainnet')
    })
  })
})
