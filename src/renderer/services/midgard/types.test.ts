import { isStaticPoolFilter } from './types'

describe('views/pools/types', () => {
  describe('isStaticPoolFilter', () => {
    it('true', () => {
      expect(isStaticPoolFilter('__usd__')).toBeTruthy()
      expect(isStaticPoolFilter('__base__')).toBeTruthy()
      expect(isStaticPoolFilter('__bep2__')).toBeTruthy()
      expect(isStaticPoolFilter('__erc20__')).toBeTruthy()
    })
    it('false', () => {
      expect(isStaticPoolFilter('unknwon')).toBeFalsy()
      expect(isStaticPoolFilter('')).toBeFalsy()
      expect(isStaticPoolFilter(null)).toBeFalsy()
      expect(isStaticPoolFilter(undefined)).toBeFalsy()
    })
  })
})
