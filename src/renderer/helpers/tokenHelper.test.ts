import { shortSymbol } from './tokenHelpers'

describe('tokenHelper', () => {
  describe('shortSymbol', () => {
    it('returns RUNE', () => {
      expect(shortSymbol('RUNE-A1F')).toEqual('RUNE')
    })
    it('returns TUSD', () => {
      expect(shortSymbol('TUSDB-000')).toEqual('TUSD')
    })
    it('returns an empty string for an empty symbol string', () => {
      expect(shortSymbol('')).toEqual('')
    })
  })
})
