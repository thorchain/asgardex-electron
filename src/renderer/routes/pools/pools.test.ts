import { base, deposit, swap, detail } from './pools'

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
      expect(deposit.path({ asset: 'BNB' })).toEqual('/pools/deposit/bnb')
    })
    it('redirects to base path if asset is empty', () => {
      expect(deposit.path({ asset: '' })).toEqual('/pools/deposit')
    })
  })

  describe('Swap routes', () => {
    it('template', () => {
      expect(swap.template).toEqual('/pools/swap/:source|:target')
    })
    it('returns path by given source/target parameters', () => {
      expect(swap.path({ source: 'BNB', target: 'RUNE' })).toEqual('/pools/swap/bnb|rune')
    })
    it('redirects to base path if source is empty', () => {
      expect(swap.path({ source: '', target: 'RUNE' })).toEqual('/pools/swap')
    })
    it('redirects to base path if target is empty', () => {
      expect(swap.path({ source: 'bnb', target: '' })).toEqual('/pools/swap')
    })
  })

  describe('PoolDetail routes', () => {
    it('template', () => {
      expect(detail.template).toEqual('/pools/detail/:symbol')
    })
    it('returns path by given symbol parameter', () => {
      expect(detail.path({ symbol: 'BNB' })).toEqual('/pools/detail/BNB')
    })
    it('redirects to pools base path if symbol is empty', () => {
      expect(detail.path({ symbol: '' })).toEqual('/pools')
    })
  })
})
