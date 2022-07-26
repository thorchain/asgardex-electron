import * as O from 'fp-ts/lib/Option'

import { getKeystoreIdFromFileName, keystoreIdsFromFileNames, validateKeystoreFileName } from './keystore'

describe('shared/utils/wallet', () => {
  describe('validateKeystoreFileName', () => {
    it('true - keystore.json|JSON', () => {
      expect(validateKeystoreFileName('keystore.json')).toBeTruthy()
      expect(validateKeystoreFileName('keystore.JSON')).toBeTruthy()
    })

    it('true - keystore-{digit}.json|JSON', () => {
      expect(validateKeystoreFileName('keystore-012345.json')).toBeTruthy()
      expect(validateKeystoreFileName('keystore-67890.JSON')).toBeTruthy()
    })
    it('false', () => {
      expect(validateKeystoreFileName('ks.json')).toBeFalsy()
      expect(validateKeystoreFileName('123.json')).toBeFalsy()
      expect(validateKeystoreFileName('keystore.js')).toBeFalsy()
      expect(validateKeystoreFileName('.keystore.json')).toBeFalsy()
    })
  })

  describe('getKeystoreIdFromFileName', () => {
    it('1 (legacy)', () => {
      const result = getKeystoreIdFromFileName('keystore.json')
      expect(result).toEqual(O.some(1))
    })
    it('1234', () => {
      const result = getKeystoreIdFromFileName('keystore-1234.json')
      expect(result).toEqual(O.some(1234))
    })

    it('1234', () => {
      const result = getKeystoreIdFromFileName('keystore-1234.json')
      expect(result).toEqual(O.some(1234))
    })
    it('none', () => {
      expect(getKeystoreIdFromFileName('1234.json')).toBeNone()
      expect(getKeystoreIdFromFileName('ks.json')).toBeNone()
      expect(getKeystoreIdFromFileName('keystore-1234a.json')).toBeNone()
      expect(getKeystoreIdFromFileName('keystore-a123.json')).toBeNone()
      expect(getKeystoreIdFromFileName('keystore-abc.json')).toBeNone()
      expect(getKeystoreIdFromFileName('ks.json')).toBeNone()
    })
  })

  describe('keystoreIdsFromFileNames', () => {
    it('1', () => {
      const result = keystoreIdsFromFileNames([
        'keystore-1234.json',
        'keystore.json',
        '.keystore.json',
        '.keystore-1234.json',
        'keystore-56789.json',
        'keystore-56.json',
        'image.jpg',
        'any.json'
      ])
      console.log('result:', result)
      expect(result).toEqual([1, 56, 1234, 56789])
    })
  })
})
