import { BNBChain, BTCChain, ETHChain, LTCChain } from '@xchainjs/xchain-util'

import { unionChains } from './array'

describe('helpers/fp/array', () => {
  describe('unionChains', () => {
    it('merges two lists of chains and removes duplicates', () => {
      const chainsA = [BNBChain, ETHChain, BTCChain]
      const chainsB = [BNBChain, BTCChain, LTCChain]
      expect(unionChains(chainsA)(chainsB)).toEqual([BNBChain, BTCChain, LTCChain, ETHChain])
    })
  })
})
