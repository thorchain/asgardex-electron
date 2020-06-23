import { some, none } from 'fp-ts/lib/Option'

import { KeystoreState, KeystoreContent } from './types'
import { getKeystoreContent, hasKeystoreContent, hasImportedKeystore, isLocked } from './util'

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
})
