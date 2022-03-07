import { bn } from '@xchainjs/xchain-util'

import { validateCustomAmountInput, validateUnboundAmountInput } from './Interact.helpers'

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
})
