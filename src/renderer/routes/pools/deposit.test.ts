import { base, deposit } from './deposit'

describe('Deposit routes', () => {
  describe('base routes', () => {
    it('template', () => {
      expect(base.template).toEqual('/pools/deposit')
    })
    it('path', () => {
      expect(base.path()).toEqual('/pools/deposit')
    })
  })
  describe('asset route', () => {
    it('template', () => {
      expect(deposit.template).toEqual('/pools/deposit/:asset')
    })
    it('returns path by given asset parameter', () => {
      expect(deposit.path({ asset: 'BNB' })).toEqual('/pools/deposit/bnb')
    })
    it('redirects to base path if asset is empty', () => {
      expect(deposit.path({ asset: '' })).toEqual(base.path())
    })
  })
})
