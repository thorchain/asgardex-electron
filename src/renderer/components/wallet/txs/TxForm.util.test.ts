import { assetAmount, bn } from '@xchainjs/xchain-util'

import { TxAmountValidatorProps, validateTxAmountInput } from './TxForm.util'

describe('wallet/txs/utils/', () => {
  describe('validateTxAmountInput', () => {
    const errors = {
      msg1: 'msg1',
      msg2: 'msg2',
      msg3: 'msg3'
    }
    const validValues: TxAmountValidatorProps = {
      input: bn('22'),
      maxAmount: assetAmount(100),
      errors
    }

    it('resolves if everything validates', async () => {
      const result = validateTxAmountInput(validValues)
      expect(result).resolves.toBeUndefined()
    })

    it('rejects for non number inputs', async () => {
      const props = { ...validValues, input: bn('hello') }
      const result = validateTxAmountInput(props)
      expect(result).rejects.toBe(errors.msg1)
    })

    it('rejects for input <= 0', async () => {
      const props = { ...validValues, input: bn('0') }
      const result = validateTxAmountInput(props)
      expect(result).rejects.toBe(errors.msg2)
    })

    it('rejects for input > maxAmount', async () => {
      const props = { ...validValues, input: bn('1001') }
      const result = validateTxAmountInput(props)
      expect(result).rejects.toBe(errors.msg3)
    })
  })
})
