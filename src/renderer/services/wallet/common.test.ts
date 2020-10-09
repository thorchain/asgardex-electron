import { none, some } from 'fp-ts/lib/Option'
import { tap } from 'rxjs/operators'

import { removeKeystore, keystoreService } from './common'

jest.mock('electron', () => ({ ipcRenderer: { send: jest.fn() } }))

const mockEncrypt = { encrypt: 'info' }
const mockDecrypt = { phrase: 'phrases' }

jest.mock('@thorchain/asgardex-crypto', () => ({
  encryptToKeyStore: () => mockEncrypt,
  decryptFromKeystore: () => Promise.resolve(mockDecrypt.phrase)
}))

describe('services/keystore/service/', () => {
  it('removeKeystore', async (done) => {
    await removeKeystore()
    keystoreService.keystore$
      .pipe(
        tap((val) => {
          expect(val).toBeNone()
          done()
        })
      )
      .subscribe()
  })

  describe('addPhrase', () => {
    const password = 'password'
    it('should reject if keystore is not imported', async () => {
      await expect(keystoreService.unlock(none, password)).rejects.toBeTruthy()
    })

    it('should call setKeystoreState', async (done) => {
      await keystoreService.unlock(some(some({ phrase: 'phrase' })), password)

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

  it('addKeystore', async (done) => {
    const removeKeystoreSpy = jest.spyOn(keystoreService, 'removeKeystore')
    const phrase = 'phrase'
    const password = 'password'
    removeKeystoreSpy.mockImplementationOnce(() => Promise.resolve())

    await keystoreService.addKeystore(phrase, password)
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
