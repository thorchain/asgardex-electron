import { Chain, chainToString, isChain } from './chain'

describe('chain', () => {
  it('isChain', () => {
    expect(isChain('BNB')).toBeTruthy()
    expect(isChain('BTC')).toBeTruthy()
    expect(isChain('BCH')).toBeTruthy()
    expect(isChain('ETH')).toBeTruthy()
    expect(isChain('THOR')).toBeTruthy()
    expect(isChain('GAIA')).toBeTruthy()
    expect(isChain('LTC')).toBeTruthy()
    expect(isChain('LTC')).toBeTruthy()
    expect(isChain('GAIA')).toBeTruthy()
    expect(isChain('AVAX')).toBeTruthy()
    expect(isChain('invalid')).toBeFalsy()
  })

  describe('chainToString', () => {
    it('THORChain', () => {
      expect(chainToString(Chain.THORChain)).toEqual('THORChain')
    })
    it('BTC', () => {
      expect(chainToString(Chain.Bitcoin)).toEqual('Bitcoin')
    })
    it('BCH', () => {
      expect(chainToString(Chain.BitcoinCash)).toEqual('Bitcoin Cash')
    })
    it('ETH', () => {
      expect(chainToString(Chain.Ethereum)).toEqual('Ethereum')
    })
    it('BNB', () => {
      expect(chainToString(Chain.Binance)).toEqual('Binance Chain')
    })
    it('GAIA', () => {
      expect(chainToString(Chain.Cosmos)).toEqual('Cosmos')
    })
    it('LTC', () => {
      expect(chainToString(Chain.Litecoin)).toEqual('Litecoin')
    })
    it('DOGE', () => {
      expect(chainToString(Chain.Doge)).toEqual('Dogecoin')
    })
    it('Avalanche', () => {
      expect(chainToString(Chain.Avalanche)).toEqual('Avalanche')
    })
  })
})
