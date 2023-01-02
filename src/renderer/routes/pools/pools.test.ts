import { base, pending, active, deposit, swap, detail } from './index'

describe('Pools routes', () => {
  describe('base route', () => {
    it('template', () => {
      expect(base.template).toEqual('/pools')
    })
    it('path', () => {
      expect(base.path()).toEqual('/pools')
    })
  })

  describe('active', () => {
    it('template', () => {
      expect(active.template).toEqual('/pools/active')
    })
    it('path', () => {
      expect(active.path()).toEqual('/pools/active')
    })
  })

  describe('pending', () => {
    it('template', () => {
      expect(pending.template).toEqual('/pools/pending')
    })
    it('path', () => {
      expect(pending.path()).toEqual('/pools/pending')
    })
  })

  describe('Deposit routes', () => {
    it('template', () => {
      expect(deposit.template).toEqual('/pools/deposit/:asset/:assetWalletType/:runeWalletType')
    })
    it('asset - keystore | rune - keystore', () => {
      expect(deposit.path({ asset: 'BNB.BNB', assetWalletType: 'keystore', runeWalletType: 'keystore' })).toEqual(
        '/pools/deposit/bnb.bnb/keystore/keystore'
      )
    })
    it('asset - ledger | rune - keystore', () => {
      expect(deposit.path({ asset: 'BNB.BNB', assetWalletType: 'ledger', runeWalletType: 'keystore' })).toEqual(
        '/pools/deposit/bnb.bnb/ledger/keystore'
      )
    })
    it('asset - keystore | rune - ledger', () => {
      expect(deposit.path({ asset: 'BNB.BNB', assetWalletType: 'keystore', runeWalletType: 'ledger' })).toEqual(
        '/pools/deposit/bnb.bnb/keystore/ledger'
      )
    })
    it('asset - ledger | rune - ledger', () => {
      expect(deposit.path({ asset: 'BNB.BNB', assetWalletType: 'ledger', runeWalletType: 'ledger' })).toEqual(
        '/pools/deposit/bnb.bnb/ledger/ledger'
      )
    })
    it('redirects for empty assets', () => {
      expect(deposit.path({ asset: '', assetWalletType: 'keystore', runeWalletType: 'keystore' })).toEqual(
        '/pools/deposit'
      )
    })
  })

  describe('Swap routes', () => {
    it('template', () => {
      expect(swap.template).toEqual('/pools/swap/:source/:sourceWalletType/:target/:targetWalletType/:recipient?')
    })
    it('source keystore / target keystore', () => {
      expect(
        swap.path({
          source: 'BNB.BNB',
          sourceWalletType: 'keystore',
          target: 'THOR.RUNE',
          targetWalletType: 'keystore'
        })
      ).toEqual('/pools/swap/bnb.bnb/keystore/thor.rune/keystore')
    })
    it('source ledger / target keystore', () => {
      expect(
        swap.path({
          source: 'BNB.BNB',
          sourceWalletType: 'ledger',
          target: 'THOR.RUNE',
          targetWalletType: 'keystore'
        })
      ).toEqual('/pools/swap/bnb.bnb/ledger/thor.rune/keystore')
    })
    it('source keystore / target ledger', () => {
      expect(
        swap.path({
          source: 'BNB.BNB',
          sourceWalletType: 'keystore',
          target: 'THOR.RUNE',
          targetWalletType: 'ledger'
        })
      ).toEqual('/pools/swap/bnb.bnb/keystore/thor.rune/ledger')
    })
    it('source ledger / target ledger', () => {
      expect(
        swap.path({
          source: 'BTC.BTC',
          sourceWalletType: 'ledger',
          target: 'ETH.ETH',
          targetWalletType: 'ledger'
        })
      ).toEqual('/pools/swap/btc.btc/ledger/eth.eth/ledger')
    })
    it('redirects if source is empty', () => {
      expect(
        swap.path({ source: '', target: 'THOR.RUNE', sourceWalletType: 'keystore', targetWalletType: 'keystore' })
      ).toEqual('/pools/swap')
    })
    it('redirects if target is empty', () => {
      expect(
        swap.path({ source: 'BNB.BNB', target: '', sourceWalletType: 'keystore', targetWalletType: 'keystore' })
      ).toEqual('/pools/swap')
    })
  })

  describe('PoolDetail routes', () => {
    it('template', () => {
      expect(detail.template).toEqual('/pools/detail/:asset')
    })
    it('returns path by given asset parameter', () => {
      expect(detail.path({ asset: 'BNB.BNB' })).toEqual('/pools/detail/BNB.BNB')
    })
    it('redirects to pools base path if symbol is empty', () => {
      expect(detail.path({ asset: '' })).toEqual('/pools')
    })
  })
})
