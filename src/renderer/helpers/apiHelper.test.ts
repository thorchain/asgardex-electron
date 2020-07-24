import * as O from 'fp-ts/lib/Option'

import { getHostnameFromUrl } from './apiHelper'

describe('helpers/apiHelper', () => {
  describe('getHostnameFromUrl', () => {
    it('parses ip from url', () => {
      const result = getHostnameFromUrl('http://121.0.0.1:8080')
      expect(result).toEqual(O.some('121.0.0.1'))
    })

    it('parses hostname from url', () => {
      const result = getHostnameFromUrl('https://testnet-dex.binance.org/api/v1/tokens')
      expect(result).toEqual(O.some('testnet-dex.binance.org'))
    })

    it('returns Nothing if parsing failed', () => {
      const result = getHostnameFromUrl('any-invalid-url')
      expect(result).toBeNone()
    })
  })
})
