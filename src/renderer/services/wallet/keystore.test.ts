import { jest } from '@jest/globals'
import { none, some } from 'fp-ts/lib/Option'
import { tap } from 'rxjs/operators'

import { removeKeystore, keystoreService } from './keystore'

jest.mock('electron', () => ({ ipcRenderer: { send: jest.fn() } }))

const mockEncrypt = { encrypt: 'info' }
const mockDecrypt = { phrase: 'phrases' }

jest.mock('@xchainjs/xchain-crypto', () => ({
  encryptToKeyStore: () => mockEncrypt,
  decryptFromKeystore: () => Promise.resolve(mockDecrypt.phrase)
}))

describe('services/keystore/service/', () => {
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

    it('should call setKeystoreState', (done) => {
      keystoreService.unlock(some(some({ phrase: 'phrase' })), password).then(() => {
        keystoreService.keystore$
          .pipe(
            tap((val) => {
              expect(val).toEqual(some(some(mockDecrypt)))
              done()
            })
          )
          .subscribe()
      })
    })
  })

  it('addKeystore', (done) => {
    const removeKeystoreSpy = jest.spyOn(keystoreService, 'removeKeystore')
    const phrase = 'phrase'
    const password = 'password'
    removeKeystoreSpy.mockImplementationOnce(() => Promise.resolve())

    keystoreService.addKeystore(phrase, password).then(() => {
      keystoreService.keystore$
        .pipe(
          tap((val) => {
            expect(val).toEqual(some(some({ phrase })))
            done()
          })
        )
        .subscribe()
    })
  })
})
