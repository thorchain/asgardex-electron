import { baseAmount } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import { describe } from 'node:test'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import { AssetBNB, AssetBTC, AssetETH, AssetRuneNative } from '../../../shared/utils/asset'
import { eqOWalletBalance, eqWalletBalances } from '../../helpers/fp/eq'
import { WalletBalances } from '../clients'
import { KeystoreState } from './types'
import {
  hasImportedKeystore,
  isLocked,
  getPhrase,
  sortBalances,
  filterNullableBalances,
  getBalanceByAsset,
  getWalletName,
  getLockedData,
  getInitialKeystoreData
} from './util'

describe('services/wallet/util/', () => {
  const phrase = 'any-phrase'
  const name = 'any-name'
  const id = 1
  const notImportedKeystore: KeystoreState = O.none
  const lockedKeystore: KeystoreState = O.some({ id, name })
  const unlockedKeystore: KeystoreState = O.some({ id, phrase, name })

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

  describe('getWalletName', () => {
    it('from unlocked keystore ', () => {
      const result = getWalletName(unlockedKeystore)
      expect(result).toEqual(O.some(name))
    })
    it('from locked keystore', () => {
      const result = getWalletName(lockedKeystore)
      expect(result).toEqual(O.some(name))
    })
    it('None (not imported)', () => {
      const result = getWalletName(notImportedKeystore)
      expect(result).toBeNone()
    })
  })

  describe('getLockedData', () => {
    it('from unlocked keystore ', () => {
      const result = getLockedData(unlockedKeystore)
      expect(result).toEqual(O.some({ id, name }))
    })
    it('from locked keystore', () => {
      const result = getLockedData(unlockedKeystore)
      expect(result).toEqual(O.some({ id, name }))
    })
    it('None (not imported)', () => {
      const result = getLockedData(notImportedKeystore)
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

  describe('getInitialKeystoreData', () => {
    it('finds selected wallet', () => {
      const result = getInitialKeystoreData([
        { id: 0, name: 'name0', selected: false },
        { id: 1, name: 'name1', selected: false },
        { id: 2, name: 'name2', selected: true },
        { id: 3, name: 'name3', selected: false }
      ])
      expect(result).toEqual(O.some({ id: 2, name: 'name2' }))
    })

    it('uses first wallet', () => {
      const result = getInitialKeystoreData([
        { id: 0, name: 'name0', selected: false },
        { id: 1, name: 'name1', selected: false },
        { id: 2, name: 'name2', selected: false },
        { id: 3, name: 'name3', selected: false }
      ])
      expect(result).toEqual(O.some({ id: 0, name: 'name0' }))
    })

    it('empty list of wallet', () => {
      const result = getInitialKeystoreData([])
      expect(result).toBeNone()
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
          walletType: 'keystore',
          hdMode: 'default'
        },
        {
          asset: ASSETS_TESTNET.BOLT,
          amount: baseAmount(1),
          walletAddress: 'ADDRESS_BOLT',
          walletIndex: 0,
          walletType: 'keystore',
          hdMode: 'default'
        },
        {
          asset: ASSETS_TESTNET.FTM,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_FTM',
          walletIndex: 0,
          walletType: 'keystore',
          hdMode: 'default'
        },
        {
          asset: AssetBNB,
          amount: baseAmount(2),
          walletAddress: 'ADDRESS_BNB',
          walletIndex: 0,
          walletType: 'keystore',
          hdMode: 'default'
        },
        {
          asset: AssetRuneNative,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_RUNENATIVE',
          walletIndex: 0,
          walletType: 'keystore',
          hdMode: 'default'
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
          walletType: 'keystore',
          hdMode: 'default'
        },
        {
          asset: ASSETS_TESTNET.BOLT,
          amount: baseAmount(1),
          walletAddress: 'ADDRESS_BOLT',
          walletIndex: 0,
          walletType: 'keystore',
          hdMode: 'default'
        },
        {
          asset: ASSETS_TESTNET.FTM,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_FTM',
          walletIndex: 0,
          walletType: 'keystore',
          hdMode: 'default'
        },
        {
          asset: AssetBNB,
          amount: baseAmount(2),
          walletAddress: 'ADDRESS_BNB',
          walletIndex: 0,
          walletType: 'keystore',
          hdMode: 'default'
        },
        {
          asset: AssetRuneNative,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_RUNENATIVE',
          walletIndex: 0,
          walletType: 'keystore',
          hdMode: 'default'
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
          walletType: 'keystore',
          hdMode: 'default'
        },
        {
          asset: ASSETS_TESTNET.BOLT,
          amount: baseAmount(1),
          walletAddress: 'ADDRESS_BOLT',
          walletIndex: 0,
          walletType: 'keystore',
          hdMode: 'default'
        },
        {
          asset: ASSETS_TESTNET.FTM,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_FTM',
          walletIndex: 0,
          walletType: 'keystore',
          hdMode: 'default'
        },
        {
          asset: AssetBNB,
          amount: baseAmount(2),
          walletAddress: 'ADDRESS_BNB',
          walletIndex: 0,
          walletType: 'keystore',
          hdMode: 'default'
        },
        {
          asset: AssetRuneNative,
          amount: baseAmount(0),
          walletAddress: 'ADDRESS_RUNENATIVE',
          walletIndex: 0,
          walletType: 'keystore',
          hdMode: 'default'
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
            walletType: 'keystore',
            hdMode: 'default'
          })
        )
      ).toBeTruthy()
    })
  })
})
