import { base, asset } from './stake'

describe('Stake routes', () => {
  describe('base routes', () => {
    it('template', () => {
      expect(base.template).toEqual('/stake')
    })
    it('path', () => {
      expect(base.path()).toEqual('/stake')
    })
  })
  describe('asset route', () => {
    it('template', () => {
      expect(asset.template).toEqual('/stake/:asset')
    })
    it('returns path by given asset parameter', () => {
      expect(asset.path({ asset: 'BNB' })).toEqual('/stake/bnb')
    })
    it('redirects to base path if asset is empty', () => {
      expect(asset.path({ asset: '' })).toEqual(base.path())
    })
  })
})
