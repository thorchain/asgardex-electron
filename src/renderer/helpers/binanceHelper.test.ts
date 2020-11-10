import { isMiniToken, isBinanceChain } from './binanceHelper'

describe('binanceHelper', () => {
  describe('isMiniToken', () => {
    it('is true`', () => {
      expect(isMiniToken({ symbol: 'MINIA-7A2M' })).toBeTruthy()
    })
    it('is false for RUNE asset', () => {
      expect(isMiniToken({ symbol: 'RUNE-B1A' })).toBeFalsy()
    })
    it('is false for BNB asset', () => {
      expect(isMiniToken({ symbol: 'BNB' })).toBeFalsy()
    })
    it('is false for empty symbol', () => {
      expect(isMiniToken({ symbol: '' })).toBeFalsy()
    })
  })

  describe('isBinanceChain', () => {
    it('is true`', () => {
      expect(isBinanceChain({ chain: 'BNB' })).toBeTruthy()
    })
    it('is false for others', () => {
      expect(isBinanceChain({ chain: 'ETH' })).toBeFalsy()
    })
  })
})
