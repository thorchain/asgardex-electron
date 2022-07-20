import { BCHChain, BNBChain, BTCChain, CosmosChain, LTCChain, THORChain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { getEthChecksumAddress, removeAddressPrefix, truncateAddress } from './addressHelper'

describe('helpers/addressHelper', () => {
  describe('truncateAddress', () => {
    it('thorchain testnet', () => {
      const result = truncateAddress('tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg', THORChain, 'testnet')
      expect(result).toEqual('tthor13g...skg')
    })

    it('thorchain mainnet', () => {
      const result = truncateAddress('thor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg', THORChain, 'mainnet')
      expect(result).toEqual('thor13g...skg')
    })

    it('bitcoin testnet', () => {
      const result = truncateAddress('tb1qtephp596jhpwrawlp67junuk347zl2cwc56xml', BTCChain, 'testnet')
      expect(result).toEqual('tb1qte...xml')
    })

    it('bitcoin mainnet', () => {
      const result = truncateAddress('bc1qtephp596jhpwrawlp67junuk347zl2cwc56xml', BTCChain, 'mainnet')
      expect(result).toEqual('bc1qte...xml')
    })

    it('bitcoin cash testnet', () => {
      const result = truncateAddress('mzvxEYsFXBhfsZj2QNwQXfFX6KCoweqZpM', BCHChain, 'testnet')
      expect(result).toEqual('mzvxEY...ZpM')
    })

    it('bitcoin cash mainnet', () => {
      const result = truncateAddress('13kwsEHsKn82UobM9WaTRbU2vCW5qXkY97', BCHChain, 'mainnet')
      expect(result).toEqual('13kwsE...Y97')
    })

    it('binance testnet', () => {
      const result = truncateAddress('tbnb1ed04qgw3s69z90jskr3shpyn9mr0e59qdtsxqa', BNBChain, 'testnet')
      expect(result).toEqual('tbnb1ed...xqa')
    })

    it('binance mainnet', () => {
      const result = truncateAddress('bnb1ed04qgw3s69z90jskr3shpyn9mr0e59qdtsxqa', BNBChain, 'mainnet')
      expect(result).toEqual('bnb1ed...xqa')
    })

    it('litecoin testnet', () => {
      const result = truncateAddress('tltc1qtephp596jhpwrawlp67junuk347zl2cwpucctk', LTCChain, 'testnet')
      expect(result).toEqual('tltc1qte...ctk')
    })

    it('litecoin mainnet', () => {
      const result = truncateAddress('ltc1qtephp596jhpwrawlp67junuk347zl2cwpucctk', LTCChain, 'mainnet')
      expect(result).toEqual('ltc1qte...ctk')
    })

    it('cosmos', () => {
      const result = truncateAddress('cosmos1av54qcmavhjkqsd67cf6f4cedqjrdeh7ed86fc', CosmosChain, 'mainnet')
      expect(result).toEqual('cosmos1av...6fc')
    })
  })

  describe('removeAddressPrefix', () => {
    it('thorchain testnet', () => {
      const result = removeAddressPrefix('tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg')
      expect(result).toEqual('tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg')
    })

    it('thorchain mainnet', () => {
      const result = removeAddressPrefix('thor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg')
      expect(result).toEqual('thor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg')
    })

    it('bitcoin testnet', () => {
      const result = removeAddressPrefix('tb1qtephp596jhpwrawlp67junuk347zl2cwc56xml')
      expect(result).toEqual('tb1qtephp596jhpwrawlp67junuk347zl2cwc56xml')
    })

    it('bitcoin mainnet', () => {
      const result = removeAddressPrefix('bc1qtephp596jhpwrawlp67junuk347zl2cwc56xml')
      expect(result).toEqual('bc1qtephp596jhpwrawlp67junuk347zl2cwc56xml')
    })

    it('bitcoin cash testnet', () => {
      const result = removeAddressPrefix('bchtest:qr20g55jd7x3dalp4qxjfgfvda0nwr8cfccrgxd0dw')
      expect(result).toEqual('qr20g55jd7x3dalp4qxjfgfvda0nwr8cfccrgxd0dw')
    })

    it('bitcoin cash mainnet', () => {
      const result = removeAddressPrefix('bitcoincash:qr20g55jd7x3dalp4qxjfgfvda0nwr8cfccrgxd0dw')
      expect(result).toEqual('qr20g55jd7x3dalp4qxjfgfvda0nwr8cfccrgxd0dw')
    })

    it('binance testnet', () => {
      const result = removeAddressPrefix('tbnb1ed04qgw3s69z90jskr3shpyn9mr0e59qdtsxqa')
      expect(result).toEqual('tbnb1ed04qgw3s69z90jskr3shpyn9mr0e59qdtsxqa')
    })

    it('binance mainnet', () => {
      const result = removeAddressPrefix('bnb1ed04qgw3s69z90jskr3shpyn9mr0e59qdtsxqa')
      expect(result).toEqual('bnb1ed04qgw3s69z90jskr3shpyn9mr0e59qdtsxqa')
    })

    it('litecoin testnet', () => {
      const result = removeAddressPrefix('tltc1qtephp596jhpwrawlp67junuk347zl2cwpucctk')
      expect(result).toEqual('tltc1qtephp596jhpwrawlp67junuk347zl2cwpucctk')
    })

    it('litecoin mainnet', () => {
      const result = removeAddressPrefix('ltc1qtephp596jhpwrawlp67junuk347zl2cwpucctk')
      expect(result).toEqual('ltc1qtephp596jhpwrawlp67junuk347zl2cwpucctk')
    })

    it('cosmos', () => {
      const address = 'cosmos1av54qcmavhjkqsd67cf6f4cedqjrdeh7ed86fc'
      const result = removeAddressPrefix(address)
      expect(result).toEqual(address)
    })
  })

  describe('getETHChecksumAddress', () => {
    it('ethereum uppercase address', () => {
      const result = getEthChecksumAddress('0x0089D53F703F7E0843953D48133F74CE247184C2')
      expect(result).toEqual(O.some('0x0089d53F703f7E0843953D48133f74cE247184c2'))
    })

    it('ethereum lowercase address', () => {
      const result = getEthChecksumAddress('0x0089d53f703f7e0843953d48133f74ce247184c2')
      expect(result).toEqual(O.some('0x0089d53F703f7E0843953D48133f74cE247184c2'))
    })

    it('wrong address', () => {
      const result = getEthChecksumAddress('0x089d53f703f7e48133f74ce247184c2')
      expect(result).toEqual(O.none)
    })

    it('empty address', () => {
      const result = getEthChecksumAddress('')
      expect(result).toEqual(O.none)
    })
  })
})
