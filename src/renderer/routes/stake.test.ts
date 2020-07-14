import { base, stake } from './stake'

describe('Stake routes', () => {
  describe('base routes', () => {
    it('template', () => {
      expect(base.template).toEqual('/pools/stake')
    })
    it('path', () => {
      expect(base.path()).toEqual('/pools/stake')
    })
  })
  describe('asset route', () => {
    it('template', () => {
      expect(stake.template).toEqual('/pools/stake/:asset')
    })
    it('returns path by given asset parameter', () => {
      expect(stake.path({ asset: 'BNB' })).toEqual('/pools/stake/bnb')
    })
    it('redirects to base path if asset is empty', () => {
      expect(stake.path({ asset: '' })).toEqual(base.path())
    })
  })
})
