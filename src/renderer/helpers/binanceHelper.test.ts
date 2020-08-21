import { Fees, Fee, DexFees, TransferFee } from '@thorchain/asgardex-binance'
import { EMPTY_ASSET, assetAmount } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../shared/mock/assets'
import { balanceByAsset, isMiniToken, getTransferFees } from './binanceHelper'

describe('binanceHelper', () => {
  describe('amountByAsset', () => {
    const txRUNE = { free: '123', symbol: ASSETS_TESTNET.RUNE.symbol.toString() }
    const txBOLT = { free: '234', symbol: ASSETS_TESTNET.BOLT.symbol.toString() }
    const txBNB = { free: '456', symbol: ASSETS_TESTNET.BOLT.symbol.toString() }
    it('returns amount of RUNE', () => {
      const result = balanceByAsset([txRUNE, txBOLT, txBNB], ASSETS_TESTNET.RUNE)
      expect(result.amount().toNumber()).toEqual(123)
    })
    it('returns 0 for unknown asset', () => {
      const result = balanceByAsset([txRUNE, txBNB], ASSETS_TESTNET.FTM)
      expect(result.amount().toNumber()).toEqual(0)
    })
    it('returns 0 for an empty list of assets', () => {
      const result = balanceByAsset([], ASSETS_TESTNET.FTM)
      expect(result.amount().toNumber()).toEqual(0)
    })
  })

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
    it('is false for EMTPY asset', () => {
      expect(isMiniToken(EMPTY_ASSET)).toBeFalsy()
    })
  })

  describe('getTransferFeeds', () => {
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
        O.fold(
          () => fail('result should be Some'),
          ({ single, multi }) => {
            expect(single.amount()).toEqual(assetAmount(37500).amount())
            return expect(multi.amount()).toEqual(assetAmount(30000).amount())
          }
        )
      )
    })
    it('returns None for an empty list of fees', () => {
      const result = getTransferFees([])
      expect(result).toBeNone()
    })
    it('returns None if no fees for transfers are available', () => {
      const result = getTransferFees([fee, dexFees])
      expect(result).toBeNone()
    })
  })
})
