import { assetAmount } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../../shared/mock/assets'
import { SendAmountValidatorProps, sendAmountValidator } from './util'

describe('wallet/txs/utils/', () => {
  describe('sendAmountValidator', () => {
    const validValues: SendAmountValidatorProps = {
      input: '22',
      fee: O.some(assetAmount(0.0035)),
      bnbAmount: assetAmount(1),
      assetWB: {
        asset: ASSETS_TESTNET.RUNE,
        balance: assetAmount(1000)
      }
    }

    it('resolves if everything validates', async () => {
      const result = sendAmountValidator(validValues)
      expect(result).resolves.toBeUndefined()
    })

    it('rejects for non number inputs', async () => {
      const props = { ...validValues, input: 'hello' }
      const result = sendAmountValidator(props)
      expect(result).rejects.toBe('Invalid input')
    })

    it('rejects for input <= 0', async () => {
      const props = { ...validValues, input: '0' }
      const result = sendAmountValidator(props)
      expect(result).rejects.toBe('input >= 0')
    })

    it('rejects for input > balance', async () => {
      const props = { ...validValues, input: '1001' }
      const result = sendAmountValidator(props)
      expect(result).rejects.toBe('input > balance')
    })

    it('rejects for invalid bnb balance (non BNB assets only)', async () => {
      const props = { ...validValues, bnbAmount: assetAmount(0.0001) }
      const result = sendAmountValidator(props)
      expect(result).rejects.toBe('fee > bnb balance')
    })

    it('rejects for input > balance - fee (BNB only)', async () => {
      const props = {
        ...validValues,
        input: '1.1',
        assetWB: {
          asset: ASSETS_TESTNET.BNB,
          balance: assetAmount(1)
        }
      }
      const result = sendAmountValidator(props)
      expect(result).rejects.toBe('BNB: input > balance - fee')
    })
  })
})
