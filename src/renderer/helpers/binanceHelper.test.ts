import { Fees, Fee, DexFees, TransferFee } from '@thorchain/asgardex-binance'
import { assetAmount } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'

import { isMiniToken, getTransferFees, isBinanceChain, getFreezeFee } from './binanceHelper'

describe('binanceHelper', () => {
  describe('isMiniToken', () => {
    it('is true`', () => {
      expect(isMiniToken({ symbol: 'MINIA-7A2M' })).toBeTruthy()
    })
    it('is false for RUNE asset', () => {
      expect(isMiniToken({ symbol: 'RUNE-B1A' })).toBeFalsy()
    })
    it('is false for BNB asset', () => {
      expect(isMiniToken({ symbol: 'BNB' })).toBeFalsy()
    })
    it('is false for empty symbol', () => {
      expect(isMiniToken({ symbol: '' })).toBeFalsy()
    })
  })

  describe('isBinanceChain', () => {
    it('is true`', () => {
      expect(isBinanceChain({ chain: 'BNB' })).toBeTruthy()
    })
    it('is false for others', () => {
      expect(isBinanceChain({ chain: 'ETH' })).toBeFalsy()
    })
    it('is false for empty chain', () => {
      expect(isBinanceChain({ chain: '' })).toBeFalsy()
    })
  })

  describe('getTransferFees', () => {
    const fee: Fee = {
      msg_type: 'submit_proposal',
      fee: 500000000,
      fee_for: 1
    }

    const fee2: Fee = {
      msg_type: 'timeLock',
      fee: 1000000,
      fee_for: 1
    }

    const dexFees: DexFees = {
      dex_fee_fields: [
        {
          fee_name: 'ExpireFee',
          fee_value: 25000
        }
      ]
    }

    const transferFee: TransferFee = {
      fixed_fee_params: {
        msg_type: 'send',
        fee: 37500,
        fee_for: 1
      },
      multi_transfer_fee: 30000,
      lower_limit_as_multi: 2
    }
    it('returns fees for transfer', () => {
      const fees: Fees = [fee, transferFee, dexFees, fee2]
      const result = getTransferFees(fees)
      FP.pipe(
        result,
        E.fold(
          () => fail('result should be Some'),
          ({ single, multi }) => {
            expect(single.amount()).toEqual(assetAmount(0.000375).amount())
            return expect(multi.amount()).toEqual(assetAmount(0.0003).amount())
          }
        )
      )
    })
    it('returns Left for an empty list of fees', () => {
      const result = getTransferFees([])
      expect(result).toBeLeft()
    })
    it('returns Left if no fees for transfers are available', () => {
      const result = getTransferFees([fee, dexFees])
      expect(result).toBeLeft()
    })
  })
  describe('getFreezeFee', () => {
    const fee: Fee = {
      msg_type: 'tokensFreeze',
      fee: 50000,
      fee_for: 1
    }

    const fee2: Fee = {
      msg_type: 'timeLock',
      fee: 1000000,
      fee_for: 1
    }

    it('returns fee for "freeze"', () => {
      const fees: Fees = [fee, fee2]
      const result = getFreezeFee(fees)
      FP.pipe(
        result,
        E.fold(
          () => fail('result should be Some'),
          (fee) => expect(fee.amount()).toEqual(assetAmount(0.0005).amount())
        )
      )
    })
    it('returns Left for an empty list of fees', () => {
      const result = getFreezeFee([])
      expect(result).toBeLeft()
    })
    it('returns Left if no fee for "freeze" is available', () => {
      const result = getFreezeFee([fee2])
      expect(result).toBeLeft()
    })
  })
})
