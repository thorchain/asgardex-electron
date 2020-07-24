import { none, some } from 'fp-ts/lib/Option'
import * as fs from 'fs-extra'
import { tap } from 'rxjs/operators'

import { removeKeystore, keystoreService, KEY_FILE } from './service'

jest.mock('electron', () => ({ ipcRenderer: { send: jest.fn() } }))

const mockEncrypt = { encrypt: 'info' }
const mockDecrypt = { phrase: 'phrases' }

jest.mock('@thorchain/asgardex-crypto', () => ({
  encryptToKeyStore: () => mockEncrypt,
  decryptFromKeystore: () => Promise.resolve(mockDecrypt.phrase)
}))

describe('services/keystore/service/', () => {
  const fsRemoveSpy = jest.spyOn(fs, 'remove')
  const fsWriteJsonSpy = jest.spyOn(fs, 'writeJSON')
  const fsEnsureFileSpy = jest.spyOn(fs, 'ensureFile')
  const fsPathExistsSpy = jest.spyOn(fs, 'pathExists')
  const fsReadJSONSpy = jest.spyOn(fs, 'readJSON')

  beforeEach(() => {
    fsRemoveSpy.mockImplementationOnce(jest.fn)
    fsWriteJsonSpy.mockImplementationOnce(jest.fn)
    fsEnsureFileSpy.mockImplementationOnce(jest.fn)
  })

  it('removeKeystore', async (done) => {
    await removeKeystore()
    expect(fsRemoveSpy).toBeCalledWith(KEY_FILE)
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
      await expect(keystoreService.unlock(some(none), password)).rejects.toBeTruthy()
    })

    it('should reject if keystore file does not exist', async () => {
      fsPathExistsSpy.mockImplementationOnce(() => Promise.resolve(false))

      await expect(keystoreService.unlock(some(none), password)).rejects.toBeTruthy()
    })

    it('should call setKeystoreState', async (done) => {
      fsPathExistsSpy.mockImplementationOnce(() => Promise.resolve(true))
      fsReadJSONSpy.mockImplementationOnce(() => Promise.resolve(mockDecrypt))

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

    expect(removeKeystoreSpy).toBeCalled()
    expect(fsEnsureFileSpy).toBeCalledWith(KEY_FILE)
    expect(fsWriteJsonSpy).toBeCalledWith(KEY_FILE, mockEncrypt)

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
