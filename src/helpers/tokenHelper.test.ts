import { shortSymbol } from './tokenHelpers'

describe('tokenHelper', () => {
  describe('shortSymbol', () => {
    it('returns RUNE', () => {
      expect(shortSymbol('RUNE-A1F')).toEqual('RUNE')
    })
    it('returns TUSD', () => {
      expect(shortSymbol('TUSDB-000')).toEqual('TUSD')
    })
    it('returns empty string if now symbol available', () => {
      expect(shortSymbol('')).toEqual('')
    })
  })
})
