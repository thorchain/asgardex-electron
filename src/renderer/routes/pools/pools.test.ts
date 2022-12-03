import { base, deposit, swap, detail, savers } from './index'

describe('Pools routes', () => {
  describe('base route', () => {
    it('template', () => {
      expect(base.template).toEqual('/pools')
    })
    it('path', () => {
      expect(base.path()).toEqual('/pools')
    })
  })

  describe('Deposit routes', () => {
    it('template', () => {
      expect(deposit.template).toEqual('/pools/deposit/:asset')
    })
    it('returns path by given asset parameter', () => {
      expect(deposit.path({ asset: 'BNB.BNB' })).toEqual('/pools/deposit/bnb.bnb')
    })
    it('redirects to base path if asset is empty', () => {
      expect(deposit.path({ asset: '' })).toEqual('/pools/deposit')
    })
  })

  describe('Savers routes', () => {
    it('template', () => {
      expect(savers.template).toEqual('/pools/savers/:asset')
    })
    it('returns path by given asset parameter', () => {
      expect(savers.path({ asset: 'BNB.BNB' })).toEqual('/pools/savers/bnb.bnb')
    })
    it('redirects to base path if asset is empty', () => {
      expect(savers.path({ asset: '' })).toEqual('/pools/savers')
    })
  })

  describe('Swap routes', () => {
    it('template', () => {
      expect(swap.template).toEqual('/pools/swap/:source|:target')
    })
    it('returns path by given source/target parameters', () => {
      expect(swap.path({ source: 'BNB.BNB', target: 'THOR.RUNE' })).toEqual('/pools/swap/bnb.bnb|thor.rune')
    })
    it('redirects to base path if source is empty', () => {
      expect(swap.path({ source: '', target: 'THOR.RUNE' })).toEqual('/pools/swap')
    })
    it('redirects to base path if target is empty', () => {
      expect(swap.path({ source: 'BNB.BNB', target: '' })).toEqual('/pools/swap')
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
