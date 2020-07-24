import { base, imports, locked, settings, assets, stakes, bonds, assetDetail, fundsSend, fundsReceive } from './wallet'

describe('Wallet routes', () => {
  describe('base routes', () => {
    it('template', () => {
      expect(base.template).toEqual('/wallet')
    })
    it('path', () => {
      expect(base.path()).toEqual('/wallet')
    })
  })

  describe('imports route', () => {
    it('template', () => {
      expect(imports.template).toEqual('/wallet/imports')
    })
    it('path', () => {
      expect(imports.path()).toEqual('/wallet/imports')
    })
  })

  describe('locked route', () => {
    it('template', () => {
      expect(locked.template).toEqual('/wallet/locked')
    })
    it('path', () => {
      expect(locked.path()).toEqual('/wallet/locked')
    })
  })

  describe('settings route', () => {
    it('template', () => {
      expect(settings.template).toEqual('/wallet/settings')
    })
    it('path', () => {
      expect(settings.path()).toEqual('/wallet/settings')
    })
  })

  describe('assets route', () => {
    it('template', () => {
      expect(assets.template).toEqual('/wallet/assets')
    })
    it('path', () => {
      expect(assets.path()).toEqual('/wallet/assets')
    })
  })
  describe('stakes route', () => {
    it('template', () => {
      expect(stakes.template).toEqual('/wallet/stakes')
    })
    it('path ', () => {
      expect(stakes.path()).toEqual('/wallet/stakes')
    })
  })
  describe('bonds route', () => {
    it('template', () => {
      expect(bonds.template).toEqual('/wallet/bonds')
    })
    it('path ', () => {
      expect(bonds.path()).toEqual('/wallet/bonds')
    })
  })

  describe('asset detail route', () => {
    it('template', () => {
      expect(assetDetail.template).toEqual('/wallet/assets/detail/:asset')
    })
    it('returns path by given asset parameter', () => {
      expect(assetDetail.path({ asset: 'BNB.BNB' })).toEqual('/wallet/assets/detail/BNB.BNB')
    })
    it('redirects to base path if asset is empty', () => {
      expect(assetDetail.path({ asset: '' })).toEqual(assets.path())
    })
  })

  describe('funds receive route', () => {
    it('template', () => {
      expect(fundsReceive.template).toEqual('/wallet/assets/detail/:asset/receive')
    })
    it('path ', () => {
      expect(fundsReceive.path({ asset: 'BNB.BNB' })).toEqual('/wallet/assets/detail/BNB.BNB/receive')
    })
  })

  describe('funds send route', () => {
    it('template', () => {
      expect(fundsSend.template).toEqual('/wallet/assets/detail/:asset/send')
    })
    it('path ', () => {
      expect(fundsSend.path({ asset: 'BNB.BNB' })).toEqual('/wallet/assets/detail/BNB.BNB/send')
    })
  })
})
