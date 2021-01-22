import {
  base,
  imports,
  locked,
  settings,
  assets,
  deposits,
  bonds,
  assetDetail,
  send,
  receive,
  upgradeBnbRune
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
  describe('deposits route', () => {
    it('template', () => {
      expect(deposits.template).toEqual('/wallet/deposits')
    })
    it('path ', () => {
      expect(deposits.path()).toEqual('/wallet/deposits')
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

  describe('receive route', () => {
    it('template', () => {
      expect(receive.template).toEqual('/wallet/assets/detail/:walletAddress/:asset/receive')
    })
    it('path ', () => {
      expect(receive.path({ asset: 'BNB.BNB', walletAddress: 'walletAddress' })).toEqual(
        '/wallet/assets/detail/walletAddress/BNB.BNB/receive'
      )
    })
    it('redirects to base path if asset is empty', () => {
      expect(receive.path({ asset: '', walletAddress: 'some wallet' })).toEqual(assets.path())
    })

    it('redirects to base path if address is empty', () => {
      expect(receive.path({ asset: 'some asset', walletAddress: '' })).toEqual(assets.path())
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

  describe.only('upgrade route', () => {
    it('template', () => {
      expect(upgradeBnbRune.template).toEqual('/wallet/assets/detail/:walletAddress/:asset/upgrade')
    })
    it('path for BNB.RUNE-67C ', () => {
      expect(upgradeBnbRune.path({ runeAsset: 'BNB.RUNE-67C', walletAddress: 'walletAddress' })).toEqual(
        '/wallet/assets/detail/walletAddress/BNB.RUNE-67C/upgrade'
      )
    })
    it('path for BNB.RUNE-B1A ', () => {
      expect(upgradeBnbRune.path({ runeAsset: 'BNB.RUNE-B1A', walletAddress: 'walletAddress' })).toEqual(
        '/wallet/assets/detail/walletAddress/BNB.RUNE-B1A/upgrade'
      )
    })
    it('redirects to base path for BNB assets ', () => {
      expect(upgradeBnbRune.path({ runeAsset: 'BNB.BNB', walletAddress: 'walletAddress' })).toEqual('/wallet/assets')
    })
    it('redirects to base path for empty addresses ', () => {
      expect(upgradeBnbRune.path({ runeAsset: 'BNB.RUNE-67C', walletAddress: '' })).toEqual('/wallet/assets')
    })
  })
})
