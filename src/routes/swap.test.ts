import { base, swap } from './swap'

describe('Swap routes', () => {
  describe('base routes', () => {
    it('template', () => {
      expect(base.template).toEqual('/swap')
    })
    it('path', () => {
      expect(base.path()).toEqual('/swap')
    })
  })
  describe('swap route', () => {
    it('template', () => {
      expect(swap.template).toEqual('/swap/:source-:target')
    })
    it('returns path by given source/target parameters', () => {
      expect(swap.path({ source: 'BNB', target: 'RUNE' })).toEqual('/swap/bnb-rune')
    })
    it('redirects to base path if source is empty', () => {
      expect(swap.path({ source: '', target: 'RUNE' })).toEqual(base.path())
    })
    it('redirects to base path if target is empty', () => {
      expect(swap.path({ source: 'bnb', target: '' })).toEqual(base.path())
    })
  })
})
