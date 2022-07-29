import * as O from 'fp-ts/Option'

import { integerFromNullableString, naturalNumberFromNullableString, optionFromNullableString } from './fp'

describe('optionFromString', () => {
  describe('shared/utils/fp', () => {
    it('empty / invalid strings', () => {
      expect(optionFromNullableString(undefined)).toBeNone()
      expect(optionFromNullableString(null)).toBeNone()
      expect(optionFromNullableString('')).toBeNone()
    })

    it('non-empty string', () => {
      expect(optionFromNullableString('test string')).toEqual(O.some('test string'))
    })
  })

  describe('integerFromNullableString', () => {
    it('1', () => {
      const result = integerFromNullableString('1')
      expect(result).toEqual(O.some(1))
    })
    it('-1', () => {
      const result = integerFromNullableString('-1')
      expect(result).toEqual(O.some(-1))
    })

    it('none', () => {
      expect(integerFromNullableString()).toBeNone()
      expect(integerFromNullableString('')).toBeNone()
      expect(integerFromNullableString('a1')).toBeNone()
      expect(integerFromNullableString('-abc1a1')).toBeNone()
      expect(integerFromNullableString(undefined)).toBeNone()
      expect(integerFromNullableString(null)).toBeNone()
    })
  })

  describe('naturalNumberFromNullableString', () => {
    it('1', () => {
      const result = naturalNumberFromNullableString('1')
      expect(result).toEqual(O.some(1))
    })

    it('none', () => {
      expect(naturalNumberFromNullableString()).toBeNone()
      expect(naturalNumberFromNullableString('')).toBeNone()
      expect(naturalNumberFromNullableString('-1')).toBeNone()
      expect(naturalNumberFromNullableString('-abc1a1')).toBeNone()
      expect(naturalNumberFromNullableString(undefined)).toBeNone()
      expect(naturalNumberFromNullableString(null)).toBeNone()
    })
  })
})
