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
      expect(earn.template).toEqual('/pools/savers/:asset/earn/:walletType')
    })
    it('asset / keystore', () => {
      expect(earn.path({ asset: 'BNB.BNB', walletType: 'keystore' })).toEqual('/pools/savers/bnb.bnb/earn/keystore')
    })
    it('asset / ledger', () => {
      expect(earn.path({ asset: 'BNB.BNB', walletType: 'ledger' })).toEqual('/pools/savers/bnb.bnb/earn/ledger')
    })
  })

  describe('Withdraw routes', () => {
    it('template', () => {
      expect(withdraw.template).toEqual('/pools/savers/:asset/withdraw/:walletType')
    })
    it('asset / keystore', () => {
      expect(withdraw.path({ asset: 'BNB.BNB', walletType: 'keystore' })).toEqual(
        '/pools/savers/bnb.bnb/withdraw/keystore'
      )
    })
    it('asset / ledger', () => {
      expect(withdraw.path({ asset: 'BNB.BNB', walletType: 'ledger' })).toEqual('/pools/savers/bnb.bnb/withdraw/ledger')
    })
  })
})
