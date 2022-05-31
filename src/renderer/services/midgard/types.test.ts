import { isStaticPoolFilter } from './types'

describe('views/pools/types', () => {
  describe('isStaticPoolFilter', () => {
    it('true', () => {
      expect(isStaticPoolFilter('usd')).toBeTruthy()
      expect(isStaticPoolFilter('base')).toBeTruthy()
      expect(isStaticPoolFilter('bep2')).toBeTruthy()
      expect(isStaticPoolFilter('erc20')).toBeTruthy()
    })
    it('false', () => {
      expect(isStaticPoolFilter('unknwon')).toBeFalsy()
      expect(isStaticPoolFilter('')).toBeFalsy()
      expect(isStaticPoolFilter(null)).toBeFalsy()
      expect(isStaticPoolFilter(undefined)).toBeFalsy()
    })
  })
})
