import { bn } from '@thorchain/asgardex-util'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'

import { validateBN, lessThanOrEqualTo, greaterThan } from './validation'

describe('helpers/form/validation', () => {
  describe('validateBN', () => {
    it('is right', () => {
      const value = bn('22')
      const result = FP.pipe(value, validateBN('errorMsg'))
      expect(result).toEqual(E.right(value))
    })
    it('is left', () => {
      const result = FP.pipe(bn('hello'), validateBN('errorMsg'))
      expect(result).toEqual(E.left('errorMsg'))
    })
  })
  describe('lessThanOrEqualTo', () => {
    it('is right', () => {
      const value = bn('2')
      const result = FP.pipe(value, lessThanOrEqualTo(bn(2))('errorMsg'))
      expect(result).toEqual(E.right(value))
    })
    it('is left', () => {
      const result = FP.pipe(bn(22), lessThanOrEqualTo(bn(2))('errorMsg'))
      expect(result).toEqual(E.left('errorMsg'))
    })
  })
  describe('greaterThan', () => {
    it('is right', () => {
      const value = bn('3')
      const result = FP.pipe(value, greaterThan(bn(2))('errorMsg'))
      expect(result).toEqual(E.right(value))
    })
    it('is left', () => {
      const result = FP.pipe(bn('1.99'), greaterThan(bn(2))('errorMsg'))
      expect(result).toEqual(E.left('errorMsg'))
    })
  })
  describe('application of validations', () => {
    it('two validations are valid', () => {
      const value = bn('1')
      const result = FP.pipe(value, validateBN('errorMsg1'), E.chain(lessThanOrEqualTo(bn(2))('errorMsg2')))
      expect(result).toEqual(E.right(value))
    })
    it('two validations results in a first error', async () => {
      const result = FP.pipe(bn('hello'), validateBN('errorMsg1'), E.chain(lessThanOrEqualTo(bn(2))('errorMsg2')))
      expect(result).toEqual(E.left('errorMsg1'))
    })
    it('two validations results in a second error', async () => {
      const result = FP.pipe(bn('3'), validateBN('errorMsg1'), E.chain(lessThanOrEqualTo(bn(2))('errorMsg2')))
      expect(result).toEqual(E.left('errorMsg2'))
    })
  })
})
