import {
  base,
  imports,
  locked,
  assets,
  bonds,
  assetDetail,
  send,
  upgradeRune,
  poolShares,
  history,
  interact
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
      expect(assetDetail.template).toEqual('/wallet/assets/detail')
    })
    it('path', () => {
      expect(assetDetail.path()).toEqual('/wallet/assets/detail')
    })
  })

  describe('send route', () => {
    it('template', () => {
      expect(send.template).toEqual('/wallet/assets/detail/send')
    })
    it('path ', () => {
      expect(send.path()).toEqual('/wallet/assets/detail/send')
    })
  })

  describe('upgrade route', () => {
    it('template', () => {
      expect(upgradeRune.template).toEqual('/wallet/assets/detail/upgrade')
    })

    it('path ', () => {
      expect(upgradeRune.path()).toEqual('/wallet/assets/detail/upgrade')
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

  describe('interact route', () => {
    it('template', () => {
      expect(interact.template).toEqual('/wallet/assets/interact/:interactType')
    })
    it('bond + keystore', () => {
      expect(interact.path({ interactType: 'bond' })).toEqual('/wallet/assets/interact/bond')
    })
    it('bond + ledger + index 1', () => {
      expect(interact.path({ interactType: 'bond' })).toEqual('/wallet/assets/interact/bond')
    })
    it('unbond', () => {
      expect(interact.path({ interactType: 'unbond' })).toEqual('/wallet/assets/interact/unbond')
    })
    it('leave', () => {
      expect(interact.path({ interactType: 'leave' })).toEqual('/wallet/assets/interact/leave')
    })
    it('custom', () => {
      expect(interact.path({ interactType: 'custom' })).toEqual('/wallet/assets/interact/custom')
    })
  })
})
