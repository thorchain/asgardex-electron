import { FeeOption } from '@xchainjs/xchain-client'
import { AssetBNB, AssetRuneNative, baseAmount, BNBChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'

import { ZERO_BASE_AMOUNT } from '../../renderer/const'
import { eqBaseAmount } from '../../renderer/helpers/fp/eq'
import { BaseAmountEncoded, baseAmountIO, ipcLedgerSendTxParamsIO, poolsWatchListsIO } from './io'

describe('shared/io', () => {
  describe('baseAmountIO', () => {
    it('encode BaseAmount', () => {
      const encoded = baseAmountIO.encode(baseAmount(1, 18))
      expect(encoded).toEqual({ amount: '1', decimal: 18 })
    })
    it('decode BaseAmount', () => {
      const encoded: BaseAmountEncoded = { amount: '1', decimal: 18 }
      const decoded = baseAmountIO.decode(encoded)
      expect(E.isRight(decoded)).toBeTruthy()

      FP.pipe(
        decoded,
        E.fold(
          (error) => {
            fail(error)
          },
          (r) => {
            expect(eqBaseAmount.equals(r, baseAmount(1, 18))).toBeTruthy()
          }
        )
      )
    })
  })
  describe('ipcLedgerSendTxParams', () => {
    it('encode IPCLedgerSendTxParams', () => {
      const encoded = ipcLedgerSendTxParamsIO.encode({
        chain: BNBChain,
        network: 'mainnet',
        asset: AssetBNB,
        feeAsset: AssetBNB,
        amount: baseAmount(10),
        sender: 'address-abc',
        recipient: 'address-abc',
        memo: 'memo-abc',
        walletIndex: 0,
        feeRate: 1,
        feeOption: FeeOption.Fast,
        feeAmount: baseAmount(1, 6)
      })
      expect(encoded).toEqual({
        chain: 'BNB',
        network: 'mainnet',
        asset: 'BNB.BNB',
        feeAsset: 'BNB.BNB',
        amount: { amount: '10', decimal: 8 },
        sender: 'address-abc',
        recipient: 'address-abc',
        memo: 'memo-abc',
        walletIndex: 0,
        feeRate: 1,
        feeOption: 'fast',
        feeAmount: { amount: '1', decimal: 6 }
      })
    })

    it('encode IPCLedgerSendTxParams - undefined fee option / fee amount', () => {
      const encoded = ipcLedgerSendTxParamsIO.encode({
        chain: BNBChain,
        network: 'mainnet',
        asset: AssetBNB,
        feeAsset: AssetBNB,
        amount: baseAmount(10),
        sender: 'address-abc',
        recipient: 'address-abc',
        memo: 'memo-abc',
        walletIndex: 0,
        feeRate: 1,
        feeOption: undefined,
        feeAmount: undefined
      })

      expect(encoded).toEqual({
        chain: 'BNB',
        network: 'mainnet',
        asset: 'BNB.BNB',
        feeAsset: 'BNB.BNB',
        amount: { amount: '10', decimal: 8 },
        sender: 'address-abc',
        recipient: 'address-abc',
        memo: 'memo-abc',
        walletIndex: 0,
        feeRate: 1,
        feeOption: undefined,
        feeAmount: undefined
      })
    })

    it('decode IPCLedgerSendTxParams', () => {
      const encoded = {
        chain: 'BNB',
        network: 'mainnet',
        asset: 'BNB.BNB',
        amount: { amount: '10', decimal: 8 },
        sender: 'address-abc',
        recipient: 'address-abc',
        memo: 'memo-abc',
        walletIndex: 0,
        feeRate: 1,
        feeAmount: { amount: '1', decimal: 6 }
      }
      const decoded = ipcLedgerSendTxParamsIO.decode(encoded)
      expect(E.isRight(decoded)).toBeTruthy()

      FP.pipe(
        decoded,
        E.fold(
          (error) => {
            fail(error)
          },
          (r) => {
            expect(r.chain).toEqual(BNBChain)
            expect(r.network).toEqual('mainnet')
            expect(r.asset).toEqual(AssetBNB)
            expect(eqBaseAmount.equals(r.amount, baseAmount(10, 8))).toBeTruthy()
            expect(r.memo).toEqual('memo-abc')
            expect(r.feeRate).toEqual(1)
            expect(eqBaseAmount.equals(r?.feeAmount ?? ZERO_BASE_AMOUNT, baseAmount(1, 6))).toBeTruthy()
          }
        )
      )
    })
    it('decode IPCLedgerSendTxParams - feeAmount undefined', () => {
      const encoded = {
        chain: 'BNB',
        network: 'mainnet',
        asset: 'BNB.BNB',
        amount: { amount: '10', decimal: 8 },
        sender: 'address-abc',
        recipient: 'address-abc',
        memo: 'memo-abc',
        walletIndex: 0,
        feeRate: 1,
        feeAmount: undefined
      }
      const decoded = ipcLedgerSendTxParamsIO.decode(encoded)
      expect(E.isRight(decoded)).toBeTruthy()

      FP.pipe(
        decoded,
        E.fold(
          (error) => {
            fail(error)
          },
          (r) => {
            expect(r?.feeAmount).toBeUndefined()
          }
        )
      )
    })
  })

  describe('poolWatchListsIO', () => {
    it('encode', () => {
      const encoded = poolsWatchListsIO.encode({
        testnet: [AssetBNB],
        stagenet: [],
        mainnet: [AssetRuneNative]
      })

      expect(encoded).toEqual({
        testnet: ['BNB.BNB'],
        mainnet: ['THOR.RUNE'],
        stagenet: []
      })
    })
  })
})
