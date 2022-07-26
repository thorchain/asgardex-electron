import { AssetBNB, AssetBTC, AssetETH, AssetRuneNative, baseAmount } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import { eqOWalletBalance, eqWalletBalances } from '../../helpers/fp/eq'
import { WalletBalances } from '../clients'
import { KeystoreState } from './types'
import {
  hasImportedKeystore,
  isLocked,
  getPhrase,
  sortBalances,
  filterNullableBalances,
  getBalanceByAsset
} from './util'

describe('services/wallet/util/', () => {
  const phrase = 'any-phrase'
  const notImportedKeystore: KeystoreState = O.none
  const lockedKeystore: KeystoreState = O.some({ id: 1 })
  const unlockedKeystore: KeystoreState = O.some({ id: 1, phrase })

  describe('getPhrase', () => {
    it('returns phrase for unlocked keystore ', () => {
      const result = getPhrase(unlockedKeystore)
      expect(result).toEqual(O.some(phrase))
    })
    it('returns None if its not imported', () => {
      const result = getPhrase(notImportedKeystore)
      expect(result).toBeNone()
    })
    it('returns None if keystore is locked', () => {
      const result = getPhrase(lockedKeystore)
      expect(result).toBeNone()
    })
  })

  describe('hasImportedKeystore', () => {
    it('true for unlocked ', () => {
      const result = hasImportedKeystore(unlockedKeystore)
      expect(result).toBeTruthy()
    })
    it('true for locked keystore', () => {
      const result = hasImportedKeystore(lockedKeystore)
      expect(result).toBeTruthy()
    })
    it('false for not imported keystore', () => {
      const result = hasImportedKeystore(notImportedKeystore)
      expect(result).toBeFalsy()
    })
  })

  describe('isLocked', () => {
    it('false for unlocked keystore', () => {
      const result = isLocked(unlockedKeystore)
      expect(result).toBeFalsy()
    })
    it('true for locked keystore', () => {
      const result = isLocked(lockedKeystore)
      expect(result).toBeTruthy()
    })
    it('true if keystore is not available', () => {
      const result = isLocked(notImportedKeystore)
      expect(result).toBeTruthy()
    })
  })

  describe('filterNullableBalances', () => {
    it('should filter nullable balances', () => {
      const target: WalletBalances = [
        {
          asset: ASSETS_TESTNET.TOMO,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_TOMO',
          walletIndex: 0,
          walletType: 'keystore'
        },
        {
          asset: ASSETS_TESTNET.BOLT,
          amount: baseAmount(1),
          walletAddress: 'ADDRESS_BOLT',
          walletIndex: 0,
          walletType: 'keystore'
        },
        {
          asset: ASSETS_TESTNET.FTM,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_FTM',
          walletIndex: 0,
          walletType: 'keystore'
        },
        {
          asset: AssetBNB,
          amount: baseAmount(2),
          walletAddress: 'ADDRESS_BNB',
          walletIndex: 0,
          walletType: 'keystore'
        },
        {
          asset: AssetRuneNative,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_RUNENATIVE',
          walletIndex: 0,
          walletType: 'keystore'
        }
      ]
      const nullableBalances = filterNullableBalances(target)
      expect(eqWalletBalances.equals(nullableBalances, [target[1], target[3]])).toBeTruthy()
    })
  })

  describe('sortBalances', () => {
    it('sorts balances based on orders', () => {
      const target: WalletBalances = [
        {
          asset: ASSETS_TESTNET.TOMO,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_TOMO',
          walletIndex: 0,
          walletType: 'keystore'
        },
        {
          asset: ASSETS_TESTNET.BOLT,
          amount: baseAmount(1),
          walletAddress: 'ADDRESS_BOLT',
          walletIndex: 0,
          walletType: 'keystore'
        },
        {
          asset: ASSETS_TESTNET.FTM,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_FTM',
          walletIndex: 0,
          walletType: 'keystore'
        },
        {
          asset: AssetBNB,
          amount: baseAmount(2),
          walletAddress: 'ADDRESS_BNB',
          walletIndex: 0,
          walletType: 'keystore'
        },
        {
          asset: AssetRuneNative,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_RUNENATIVE',
          walletIndex: 0,
          walletType: 'keystore'
        }
      ]
      const balances = sortBalances(target, [AssetBTC.ticker, AssetETH.ticker, AssetRuneNative.ticker, AssetBNB.ticker])
      expect(eqWalletBalances.equals(balances, [target[4], target[3], target[1], target[2], target[0]])).toBeTruthy()
    })
  })

  describe('getBalanceByAsset', () => {
    it('get balance by asset', () => {
      const walletBalances: WalletBalances = [
        {
          asset: ASSETS_TESTNET.TOMO,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_TOMO',
          walletIndex: 0,
          walletType: 'keystore'
        },
        {
          asset: ASSETS_TESTNET.BOLT,
          amount: baseAmount(1),
          walletAddress: 'ADDRESS_BOLT',
          walletIndex: 0,
          walletType: 'keystore'
        },
        {
          asset: ASSETS_TESTNET.FTM,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_FTM',
          walletIndex: 0,
          walletType: 'keystore'
        },
        {
          asset: AssetBNB,
          amount: baseAmount(2),
          walletAddress: 'ADDRESS_BNB',
          walletIndex: 0,
          walletType: 'keystore'
        },
        {
          asset: AssetRuneNative,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_RUNENATIVE',
          walletIndex: 0,
          walletType: 'keystore'
        }
      ]

      const balanceByAsset = getBalanceByAsset(AssetBNB)(walletBalances)
      expect(
        eqOWalletBalance.equals(
          balanceByAsset,
          O.some({
            asset: AssetBNB,
            amount: baseAmount(2),
            walletAddress: 'ADDRESS_BNB',
            walletIndex: 0,
            walletType: 'keystore'
          })
        )
      ).toBeTruthy()
    })
  })
})
