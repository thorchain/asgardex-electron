import { base, assets, stakes, bonds, assetDetails } from './wallet'

describe('Wallet routes', () => {
  describe('base routes', () => {
    it('template', () => {
      expect(base.template).toEqual('/wallet')
    })
    it('path', () => {
      expect(base.path()).toEqual('/wallet')
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
      expect(assetDetails.template).toEqual('/wallet/asset-details/:symbol')
    })
    it('returns path by given asset parameter', () => {
      expect(assetDetails.path({ symbol: 'BNB' })).toEqual('/wallet/asset-details/bnb')
    })
    it('redirects to base path if asset is empty', () => {
      expect(assetDetails.path({ symbol: '' })).toEqual(assets.path())
    })
  })
})
