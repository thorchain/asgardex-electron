import { jest } from '@jest/globals'
import { none, some } from 'fp-ts/lib/Option'
import { tap } from 'rxjs/operators'

import { removeKeystore, keystoreService } from './keystore'

jest.mock('electron', () => ({ ipcRenderer: { send: jest.fn() } }))

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const mockEncrypt = { encrypt: 'info' }
const mockDecrypt = { phrase }

jest.unstable_mockModule('crypto', () => ({
  __esModule: true,
  default: {
    getRandomValues: jest.fn()
  }
}))

jest.unstable_mockModule('@xchainjs/xchain-crypto', () => ({
  __esModule: true,
  default: {
    encryptToKeyStore: () => Promise.resolve(mockEncrypt),
    decryptFromKeystore: () => Promise.resolve(mockDecrypt.phrase)
  }
}))

// jest.doMock('@xchainjs/xchain-crypto', () => ({
//   encryptToKeyStore: () => mockEncrypt,
//   decryptFromKeystore: () => Promise.resolve(mockDecrypt.phrase)
// }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any

describe('services/keystore/service/', () => {
  beforeEach(() => {
    // _crypto.mockClear()
    // _xcrypto.mockClear()
  })
  it('removeKeystore', (done) => {
    removeKeystore().then(() =>
      keystoreService.keystore$
        .pipe(
          tap((val) => {
            expect(val).toBeNone()
            done()
          })
        )
        .subscribe()
    )
  })

  describe('addPhrase', () => {
    const password = 'password'
    it('should reject if keystore is not imported', async () => {
      await expect(keystoreService.unlock(none, password)).rejects.toBeTruthy()
    })

    it('should call setKeystoreState', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _crypto: any = (await import('crypto')).default
      console.log('_crypto:', _crypto)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _xcrypto: any = (await import('@xchainjs/xchain-crypto')).default
      console.log('_xcrypto:', _xcrypto)
      await keystoreService.unlock(some(some({ phrase })), password)
      keystoreService.keystore$
        .pipe(
          tap((val) => {
            expect(val).toEqual(some(some(mockDecrypt)))
          })
        )
        .subscribe()
    })
  })

  it('addKeystore', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _crypto: any = (await import('crypto')).default
    console.log('_crypto:', _crypto)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _xcrypto: any = (await import('@xchainjs/xchain-crypto')).default
    console.log('_xcrypto:', _xcrypto)
    const removeKeystoreSpy = jest.spyOn(keystoreService, 'removeKeystore')
    const password = 'password'
    removeKeystoreSpy.mockImplementationOnce(() => Promise.resolve())

    await keystoreService.addKeystore(phrase, password)

    keystoreService.keystore$
      .pipe(
        tap((val) => {
          expect(val).toEqual(some(some({ phrase })))
        })
      )
      .subscribe()
  })
})
