import { Network } from '@xchainjs/xchain-client'

import { toClientNetwork } from '../../../shared/utils/client'

describe('services/utils/', () => {
  describe('getClientNetwork', () => {
    it('for testnet', () => {
      expect(toClientNetwork('testnet')).toEqual(Network.Testnet)
    })
    it('for mainnent', () => {
      expect(toClientNetwork('mainnet')).toEqual(Network.Mainnet)
    })
  })
})
