import {
  AvalancheChain,
  BCHChain,
  BNBChain,
  BTCChain,
  chainToString,
  CosmosChain,
  DOGEChain,
  ETHChain,
  isChain,
  LTCChain,
  THORChain
} from './chain'

describe('chain', () => {
  it('isChain', () => {
    expect(isChain('BNB')).toBeTruthy()
    expect(isChain('BTC')).toBeTruthy()
    expect(isChain('BCH')).toBeTruthy()
    expect(isChain('ETH')).toBeTruthy()
    expect(isChain('THOR')).toBeTruthy()
    expect(isChain('GAIA')).toBeTruthy()
    expect(isChain('LTC')).toBeTruthy()
    expect(isChain('GAIA')).toBeTruthy()
    expect(isChain('AVAX')).toBeTruthy()
    expect(isChain('invalid')).toBeFalsy()
    expect(isChain('')).toBeFalsy()
  })

  describe('chainToString', () => {
    it('THORChain', () => {
      expect(chainToString(THORChain)).toEqual('THORChain')
    })
    it('BTC', () => {
      expect(chainToString(BTCChain)).toEqual('Bitcoin')
    })
    it('BCH', () => {
      expect(chainToString(BCHChain)).toEqual('Bitcoin Cash')
    })
    it('ETH', () => {
      expect(chainToString(ETHChain)).toEqual('Ethereum')
    })
    it('BNB', () => {
      expect(chainToString(BNBChain)).toEqual('Binance Chain')
    })
    it('GAIA', () => {
      expect(chainToString(CosmosChain)).toEqual('Cosmos')
    })
    it('LTC', () => {
      expect(chainToString(LTCChain)).toEqual('Litecoin')
    })
    it('DOGE', () => {
      expect(chainToString(DOGEChain)).toEqual('Dogecoin')
    })
    it('Avalanche', () => {
      expect(chainToString(AvalancheChain)).toEqual('Avalanche')
    })
  })
})
