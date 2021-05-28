import {
  base,
  imports,
  locked,
  settings,
  assets,
  bonds,
  assetDetail,
  send,
  upgradeRune,
  poolShares,
  history
} from './wallet'

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
      expect(imports.base.template).toEqual('/wallet/import')
      expect(imports.keystore.template).toEqual('/wallet/import/keystore')
      expect(imports.phrase.template).toEqual('/wallet/import/phrase')
    })
    it('path', () => {
      expect(imports.base.path()).toEqual('/wallet/import')
      expect(imports.keystore.path()).toEqual('/wallet/import/keystore')
      expect(imports.phrase.path()).toEqual('/wallet/import/phrase')
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
  describe('poolShares route', () => {
    it('template', () => {
      expect(poolShares.template).toEqual('/wallet/poolshares')
    })
    it('path ', () => {
      expect(poolShares.path()).toEqual('/wallet/poolshares')
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
      expect(assetDetail.template).toEqual('/wallet/assets/detail/:walletAddress/:asset')
    })
    it('returns path by given asset parameter', () => {
      expect(assetDetail.path({ asset: 'BNB.BNB', walletAddress: 'walletAddress' })).toEqual(
        '/wallet/assets/detail/walletAddress/BNB.BNB'
      )
    })
    it('redirects to base path if asset is empty', () => {
      expect(assetDetail.path({ asset: '', walletAddress: 'some wallet' })).toEqual(assets.path())
    })

    it('redirects to base path if address is empty', () => {
      expect(assetDetail.path({ asset: 'some asset', walletAddress: '' })).toEqual(assets.path())
    })
  })

  describe('send route', () => {
    it('template', () => {
      expect(send.template).toEqual('/wallet/assets/detail/:walletAddress/:asset/send')
    })
    it('path ', () => {
      expect(send.path({ asset: 'BNB.BNB', walletAddress: 'walletAddress' })).toEqual(
        '/wallet/assets/detail/walletAddress/BNB.BNB/send'
      )
    })
    it('redirects to base path if asset is empty', () => {
      expect(send.path({ asset: '', walletAddress: 'some wallet' })).toEqual(assets.path())
    })

    it('redirects to base path if address is empty', () => {
      expect(send.path({ asset: 'some asset', walletAddress: '' })).toEqual(assets.path())
    })
  })

  describe('upgrade route', () => {
    it('template', () => {
      expect(upgradeRune.template).toEqual('/wallet/assets/detail/:walletAddress/:asset/upgrade')
    })
    it('path for BNB.RUNE-67C ', () => {
      expect(upgradeRune.path({ asset: 'BNB.RUNE-67C', walletAddress: 'walletAddress' })).toEqual(
        '/wallet/assets/detail/walletAddress/BNB.RUNE-67C/upgrade'
      )
    })
    it('path for BNB.RUNE-B1A ', () => {
      expect(upgradeRune.path({ asset: 'BNB.RUNE-B1A', walletAddress: 'walletAddress' })).toEqual(
        '/wallet/assets/detail/walletAddress/BNB.RUNE-B1A/upgrade'
      )
    })
    it('redirects to base path for BNB assets ', () => {
      expect(upgradeRune.path({ asset: 'BNB.BNB', walletAddress: 'walletAddress' })).toEqual('/wallet/assets')
    })
    it('redirects to base path for empty addresses ', () => {
      expect(upgradeRune.path({ asset: 'BNB.RUNE-67C', walletAddress: '' })).toEqual('/wallet/assets')
    })
  })

  describe('history routes', () => {
    it('template', () => {
      expect(history.template).toEqual('/wallet/history')
    })
    it('path', () => {
      expect(history.path()).toEqual('/wallet/history')
    })
  })
})
