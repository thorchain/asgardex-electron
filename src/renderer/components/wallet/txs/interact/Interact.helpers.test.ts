import { bn } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import {
  getInteractTypeFromNullableString,
  isInteractType,
  validateCustomAmountInput,
  validateUnboundAmountInput
} from './Interact.helpers'

describe('wallet/interact/helpers', () => {
  describe('validateUnboundAmountInput', () => {
    const errors = {
      msg1: 'msg1',
      msg2: 'msg2'
    }
    const validValues = {
      input: bn(22),
      errors
    }

    it('valid (> 0)', async () => {
      const result = validateUnboundAmountInput(validValues)
      expect(result).resolves.toBeUndefined()
    })

    it('invalid (not numbers)', async () => {
      const props = { ...validValues, input: bn('hello') }
      const result = validateUnboundAmountInput(props)
      expect(result).rejects.toBe(errors.msg1)
    })

    it('invalid (input < 0)', async () => {
      const props = { ...validValues, input: bn(-1) }
      const result = validateUnboundAmountInput(props)
      expect(result).rejects.toBe(errors.msg2)
    })

    it('invalid (input === 0)', async () => {
      const props = { ...validValues, input: bn('0') }
      const result = validateUnboundAmountInput(props)
      expect(result).rejects.toBe(errors.msg2)
    })
  })

  describe('validateCustomAmountInput', () => {
    const errors = {
      msg1: 'msg1',
      msg2: 'msg2'
    }
    const validValues = {
      input: bn(22),
      errors
    }

    it('valid (> 0)', async () => {
      const result = validateCustomAmountInput(validValues)
      expect(result).resolves.toBeUndefined()
    })

    it('valid (=== 0)', async () => {
      const props = { ...validValues, input: bn(0) }
      const result = validateCustomAmountInput(props)
      expect(result).resolves.toBeUndefined()
    })

    it('invalid (not numbers)', async () => {
      const props = { ...validValues, input: bn('hello') }
      const result = validateCustomAmountInput(props)
      expect(result).rejects.toBe(errors.msg1)
    })

    it('invalid (input <= 0)', async () => {
      const props = { ...validValues, input: bn(-1) }
      const result = validateCustomAmountInput(props)
      expect(result).rejects.toBe(errors.msg2)
    })
  })

  describe('isInteractType', () => {
    it('bond', () => {
      const result = isInteractType('bond')
      expect(result).toBeTruthy()
    })
    it('unbond', () => {
      const result = isInteractType('unbond')
      expect(result).toBeTruthy()
    })
    it('leave', () => {
      const result = isInteractType('leave')
      expect(result).toBeTruthy()
    })
    it('custom', () => {
      const result = isInteractType('custom')
      expect(result).toBeTruthy()
    })
    it('invalid', () => {
      const result = isInteractType('invalid')
      expect(result).toBeFalsy()
    })
    it('null', () => {
      const result = isInteractType(null)
      expect(result).toBeFalsy()
    })
  })

  describe('getInteractTypeFromNullableString', () => {
    it('bond', () => {
      const result = getInteractTypeFromNullableString('bond')
      expect(result).toEqual(O.some('bond'))
    })
    it('unbond', () => {
      const result = getInteractTypeFromNullableString('unbond')
      expect(result).toEqual(O.some('unbond'))
    })
    it('leave', () => {
      const result = getInteractTypeFromNullableString('leave')
      expect(result).toEqual(O.some('leave'))
    })
    it('custom', () => {
      const result = getInteractTypeFromNullableString('custom')
      expect(result).toEqual(O.some('custom'))
    })
    it('invalid', () => {
      const result = getInteractTypeFromNullableString('invalid')
      expect(result).toBeNone()
    })
    it('undefined', () => {
      const result = getInteractTypeFromNullableString()
      expect(result).toBeNone()
    })
  })
})
