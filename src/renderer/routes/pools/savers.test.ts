import { base, earn, withdraw } from './savers'

describe('Savers routes', () => {
  describe('base route', () => {
    it('template', () => {
      expect(base.template).toEqual('/pools/savers')
    })
    it('path', () => {
      expect(base.path()).toEqual('/pools/savers')
    })
  })

  describe('Earn routes', () => {
    it('template', () => {
      expect(earn.template).toEqual('/pools/savers/:asset/earn')
    })
    it('returns path by given asset parameter', () => {
      expect(earn.path({ asset: 'BNB.BNB' })).toEqual('/pools/savers/bnb.bnb/earn')
    })
    it('redirects to base path if asset is empty', () => {
      expect(earn.path({ asset: '' })).toEqual('/pools/savers')
    })
  })

  describe('Withdraw routes', () => {
    it('template', () => {
      expect(withdraw.template).toEqual('/pools/savers/:asset/withdraw')
    })
    it('returns path by given asset parameter', () => {
      expect(withdraw.path({ asset: 'BNB.BNB' })).toEqual('/pools/savers/bnb.bnb/withdraw')
    })
    it('redirects to base path if asset is empty', () => {
      expect(withdraw.path({ asset: '' })).toEqual('/pools/savers')
    })
  })
})
