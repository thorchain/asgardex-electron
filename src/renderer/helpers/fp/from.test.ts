import * as O from 'fp-ts/Option'

import { optionFromNullableString } from './from'

describe('optionFromString', () => {
  it('should return O.none for nullable values', () => {
    expect(optionFromNullableString(undefined)).toEqual(O.none)
    expect(optionFromNullableString(null)).toEqual(O.none)
  })

  it('should return O.none for empty string', () => {
    expect(optionFromNullableString('')).toEqual(O.none)
  })

  it('should return O.some for non-empty string', () => {
    expect(optionFromNullableString('test string')).toEqual(O.some('test string'))
  })
})
