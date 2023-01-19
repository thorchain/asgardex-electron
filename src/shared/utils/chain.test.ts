import { BNBChain } from '@xchainjs/xchain-binance'
import { BTCChain } from '@xchainjs/xchain-bitcoin'
import { BCHChain } from '@xchainjs/xchain-bitcoincash'
import { GAIAChain } from '@xchainjs/xchain-cosmos'
import { DOGEChain } from '@xchainjs/xchain-doge'
import { ETHChain } from '@xchainjs/xchain-ethereum'
import { LTCChain } from '@xchainjs/xchain-litecoin'
import { THORChain } from '@xchainjs/xchain-thorchain'

import { chainToString, isEnabledChain } from './chain'

describe('chain', () => {
  it('isEnabledChain', () => {
    expect(isEnabledChain('BNB')).toBeTruthy()
    expect(isEnabledChain('BTC')).toBeTruthy()
    expect(isEnabledChain('BCH')).toBeTruthy()
    expect(isEnabledChain('ETH')).toBeTruthy()
    expect(isEnabledChain('THOR')).toBeTruthy()
    expect(isEnabledChain('GAIA')).toBeTruthy()
    expect(isEnabledChain('LTC')).toBeTruthy()
    expect(isEnabledChain('GAIA')).toBeTruthy()
    expect(isEnabledChain('invalid')).toBeFalsy()
    expect(isEnabledChain('')).toBeFalsy()
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
      expect(chainToString(GAIAChain)).toEqual('Cosmos')
    })
    it('LTC', () => {
      expect(chainToString(LTCChain)).toEqual('Litecoin')
    })
    it('DOGE', () => {
      expect(chainToString(DOGEChain)).toEqual('Dogecoin')
    })
  })
})
