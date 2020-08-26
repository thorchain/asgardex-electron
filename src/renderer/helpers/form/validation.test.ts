import { bn } from '@thorchain/asgardex-util'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'

import { validateBN, lessThanOrEqualTo, greaterThan } from './validation'

describe('helpers/form/validation', () => {
  describe('validateBN', () => {
    it('is right', () => {
      const result = FP.pipe('22', validateBN('errorMsg'))
      expect(result).toEqual(E.right('22'))
    })
    it('is left', () => {
      const result = FP.pipe('hello', validateBN('errorMsg'))
      expect(result).toEqual(E.left('errorMsg'))
    })
  })
  describe('lessThanOrEqualTo', () => {
    it('is right', () => {
      const result = FP.pipe('2', lessThanOrEqualTo(bn(2))('errorMsg'))
      expect(result).toEqual(E.right('2'))
    })
    it('is left', () => {
      const result = FP.pipe('22', lessThanOrEqualTo(bn(2))('errorMsg'))
      expect(result).toEqual(E.left('errorMsg'))
    })
  })
  describe('greaterThan', () => {
    it('is right', () => {
      const result = FP.pipe('3', greaterThan(bn(2))('errorMsg'))
      expect(result).toEqual(E.right('3'))
    })
    it('is left', () => {
      const result = FP.pipe('1.99', greaterThan(bn(2))('errorMsg'))
      expect(result).toEqual(E.left('errorMsg'))
    })
  })
  describe('application of validations', () => {
    it('two validations are valid', () => {
      const result = FP.pipe('1', validateBN('errorMsg1'), E.chain(lessThanOrEqualTo(bn(2))('errorMsg2')))
      expect(result).toEqual(E.right('1'))
    })
    it('two validations results in a first error', async () => {
      const result = FP.pipe('hello', validateBN('errorMsg1'), E.chain(lessThanOrEqualTo(bn(2))('errorMsg2')))
      expect(result).toEqual(E.left('errorMsg1'))
    })
    it('two validations results in a second error', async () => {
      const result = FP.pipe('3', validateBN('errorMsg1'), E.chain(lessThanOrEqualTo(bn(2))('errorMsg2')))
      expect(result).toEqual(E.left('errorMsg2'))
    })
  })
})
