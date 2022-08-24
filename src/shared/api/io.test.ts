import { fail } from 'assert'

import { FeeOption } from '@xchainjs/xchain-client'
import { AssetBNB, AssetRuneNative, baseAmount, BNBChain, ETHChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'

import { ZERO_BASE_AMOUNT } from '../../renderer/const'
import { eqBaseAmount } from '../../renderer/helpers/fp/eq'
import { MOCK_KEYSTORE } from '../mock/wallet'
import { mapIOErrors } from '../utils/fp'
import {
  BaseAmountEncoded,
  baseAmountIO,
  IPCKeystoresLedgerAddressesIO,
  ipcKeystoreWalletIO,
  ipcKeystorLedgerAddressesIO,
  ipcLedgerSendTxParamsIO,
  isBaseAmountEncoded,
  keystoreIO,
  KeystoreWallet,
  poolsWatchListsIO
} from './io'

describe('shared/io', () => {
  describe('isBaseAmountEncoded', () => {
    it('true', () => {
      const encoded = {
        amount: '1',
        decimal: 10
      }
      expect(isBaseAmountEncoded(encoded)).toBeTruthy()
    })
    it('false - no amount', () => {
      const encoded = {
        decimal: 10
      }
      expect(isBaseAmountEncoded(encoded)).toBeFalsy()
    })
    it('false - no decimal', () => {
      const encoded = {
        amount: '1'
      }
      expect(isBaseAmountEncoded(encoded)).toBeFalsy()
    })
    it('false misc.', () => {
      expect(isBaseAmountEncoded(null)).toBeFalsy()
      expect(isBaseAmountEncoded(undefined)).toBeFalsy()
      expect(isBaseAmountEncoded(1)).toBeFalsy()
      expect(isBaseAmountEncoded(true)).toBeFalsy()
      expect(isBaseAmountEncoded(false)).toBeFalsy()
      expect(isBaseAmountEncoded('')).toBeFalsy()
      expect(isBaseAmountEncoded('hello-world')).toBeFalsy()
      expect(
        isBaseAmountEncoded({
          hello: 'world'
        })
      ).toBeFalsy()
    })
  })
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
          (errors) => {
            fail(mapIOErrors(errors))
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
        feeAmount: baseAmount(1, 6),
        nodeUrl: 'node-url'
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
        feeAmount: { amount: '1', decimal: 6 },
        nodeUrl: 'node-url'
      })
    })

    it('encode IPCLedgerSendTxParams - undefined fee option / fee amount / nodeUrl', () => {
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
        feeAmount: undefined,
        nodeUrl: undefined
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
        feeAmount: undefined,
        nodeUrl: undefined
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
          (errors) => {
            fail(mapIOErrors(errors))
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
          (errors) => {
            fail(mapIOErrors(errors))
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

  describe('keystoreIO', () => {
    it('decoded', () => {
      const data = JSON.parse(JSON.stringify(MOCK_KEYSTORE))

      const decoded = keystoreIO.decode(data)

      FP.pipe(
        decoded,
        E.fold(
          (errors) => {
            fail(mapIOErrors(errors))
          },
          (result) => {
            expect(result).toEqual(MOCK_KEYSTORE)
          }
        )
      )
    })

    it('encode', () => {
      const encoded = keystoreIO.encode(MOCK_KEYSTORE)
      expect(encoded).toEqual(JSON.parse(JSON.stringify(MOCK_KEYSTORE)))
    })
  })

  describe('ipcKeystoreWalletIO', () => {
    const keystoreWallet: KeystoreWallet = {
      id: 1,
      name: 'wallet1',
      selected: true,
      keystore: MOCK_KEYSTORE
    }
    it('decoded', () => {
      const data = JSON.parse(JSON.stringify(keystoreWallet))

      const decoded = ipcKeystoreWalletIO.decode(data)

      FP.pipe(
        decoded,
        E.fold(
          (errors) => {
            fail(mapIOErrors(errors))
          },
          (result) => {
            expect(result).toEqual(keystoreWallet)
          }
        )
      )
    })
    it('encode', () => {
      const encoded = ipcKeystoreWalletIO.encode(keystoreWallet)
      expect(encoded).toEqual(JSON.parse(JSON.stringify(keystoreWallet)))
    })
    it('round-trip', () => {
      const encoded = ipcKeystoreWalletIO.encode(keystoreWallet)
      const decoded = ipcKeystoreWalletIO.decode(encoded)

      FP.pipe(
        decoded,
        E.fold(
          (errors) => {
            fail(mapIOErrors(errors))
          },
          (result) => {
            expect(result).toEqual(keystoreWallet)
          }
        )
      )
    })
  })
})
describe('ipcKeystoreWalletIO', () => {
  const ledgers: IPCKeystoresLedgerAddressesIO = [
    {
      keystoreId: 1,
      ledgers: [
        {
          chain: ETHChain,
          network: 'mainnet',
          address: 'eth-address',
          walletIndex: 1,
          ethDerivationMode: 'metamask'
        },
        {
          chain: BNBChain,
          network: 'stagenet',
          address: 'nbn-address',
          walletIndex: 2,
          ethDerivationMode: undefined
        }
      ]
    }
  ]
  it('decoded', () => {
    const data = JSON.parse(JSON.stringify(ledgers))

    const decoded = ipcKeystorLedgerAddressesIO.decode(data)

    FP.pipe(
      decoded,
      E.fold(
        (errors) => {
          fail(mapIOErrors(errors))
        },
        (result) => {
          expect(result).toEqual(ledgers)
        }
      )
    )
  })
  it('encode', () => {
    const encoded = ipcKeystorLedgerAddressesIO.encode(ledgers)
    expect(encoded).toEqual(JSON.parse(JSON.stringify(ledgers)))
  })

  it('round-trip', () => {
    const encoded = ipcKeystorLedgerAddressesIO.encode(ledgers)
    const decoded = ipcKeystorLedgerAddressesIO.decode(encoded)

    FP.pipe(
      decoded,
      E.fold(
        (errors) => {
          fail(mapIOErrors(errors))
        },
        (result) => {
          expect(result).toEqual(ledgers)
        }
      )
    )
  })
})
