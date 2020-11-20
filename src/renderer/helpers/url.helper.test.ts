import * as O from 'fp-ts/Option'

import { getUrlSearchParam } from './url.helper'

describe('helpers/url.helpers', () => {
  describe('getUrlSearchParam', () => {
    it('should return O.none', () => {
      expect(getUrlSearchParam('', '')).toEqual(O.none)
      expect(getUrlSearchParam('', 'param')).toEqual(O.none)
      expect(getUrlSearchParam('http://valid.url?anotherValue', 'param')).toEqual(O.none)
    })

    it('should return O.some value', () => {
      expect(getUrlSearchParam('?param=value', 'param')).toEqual(O.some('value'))
      expect(getUrlSearchParam('http://valid.url?param=value', 'param')).toEqual(O.some('value'))
      expect(getUrlSearchParam('http://valid.url?&another&param=value', 'param')).toEqual(O.some('value'))
      expect(getUrlSearchParam('http://valid.url?&another&param=value', 'another')).toEqual(O.some(''))
    })
  })
})
