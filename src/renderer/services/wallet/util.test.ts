import { AssetBNB, AssetBTC, AssetETH, AssetRuneNative, baseAmount } from '@xchainjs/xchain-util'
import { some, none } from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import { eqOWalletBalance, eqWalletBalances } from '../../helpers/fp/eq'
import { WalletBalances } from '../clients'
import { KeystoreState, KeystoreContent } from './types'
import {
  getKeystoreContent,
  hasKeystoreContent,
  hasImportedKeystore,
  isLocked,
  getPhrase,
  sortBalances,
  filterNullableBalances,
  getBalanceByAsset
} from './util'

describe('services/wallet/util/', () => {
  describe('getKeystoreContent', () => {
    it('returns content of keystore state', () => {
      const content: KeystoreContent = { phrase: 'any-phrase' }
      const state: KeystoreState = some(some(content))
      const result = getKeystoreContent(state)
      expect(result).toEqual(some(content))
    })
    it('returns None if content is not available', () => {
      const state: KeystoreState = some(none)
      const result = getKeystoreContent(state)
      expect(result).toBeNone()
    })
    it('returns None if keystore is not available', () => {
      const result = getKeystoreContent(none)
      expect(result).toBeNone()
    })
  })

  describe('getPhrase', () => {
    it('returns phrase if available of keystore state', () => {
      const phrase = 'any-phrase'
      const content: KeystoreContent = { phrase }
      const state: KeystoreState = some(some(content))
      const result = getPhrase(state)
      expect(result).toEqual(some(phrase))
    })
    it('returns None if content is not available', () => {
      const state: KeystoreState = some(none)
      const result = getPhrase(state)
      expect(result).toBeNone()
    })
    it('returns None if keystore is not available', () => {
      const result = getPhrase(none)
      expect(result).toBeNone()
    })
  })

  describe('hasKeystoreContent', () => {
    it('returns true if content of keystore is available', () => {
      const state: KeystoreState = some(some({ phrase: 'any-phrase' }))
      const result = hasKeystoreContent(state)
      expect(result).toBeTruthy()
    })
    it('returns false if content is not available', () => {
      const state: KeystoreState = some(none)
      const result = hasKeystoreContent(state)
      expect(result).toBeFalsy()
    })
    it('returns false if keystore is not available', () => {
      const result = hasKeystoreContent(none)
      expect(result).toBeFalsy()
    })
  })

  describe('hasImportedKeystore', () => {
    it('returns true if keystore is available including its content', () => {
      const state: KeystoreState = some(some({ phrase: 'any-phrase' }))
      const result = hasImportedKeystore(state)
      expect(result).toBeTruthy()
    })
    it('returns true if keystore is available, but no content', () => {
      const state: KeystoreState = some(none)
      const result = hasImportedKeystore(state)
      expect(result).toBeTruthy()
    })
    it('returns false if keystore is not available', () => {
      const result = hasImportedKeystore(none)
      expect(result).toBeFalsy()
    })
  })

  describe('isLocked', () => {
    it('returns false if keystore is available including its content', () => {
      const state: KeystoreState = some(some({ phrase: 'any-phrase' }))
      const result = isLocked(state)
      expect(result).toBeFalsy()
    })
    it('returns true if keystore is available, but no content', () => {
      const state: KeystoreState = some(none)
      const result = isLocked(state)
      expect(result).toBeTruthy()
    })
    it('returns true if keystore is not available', () => {
      const result = isLocked(none)
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
          some({
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
