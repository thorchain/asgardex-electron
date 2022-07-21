import * as O from 'fp-ts/lib/Option'
import * as RxOp from 'rxjs/operators'

import { removeKeystore, keystoreService } from './keystore'

jest.mock('electron', () => ({ ipcRenderer: { send: jest.fn() } }))

const MOCK_KS_ID = 'mock-keystore-id'
const mockEncrypt = { encrypt: 'info' }
const mockDecrypt = { id: MOCK_KS_ID, phrase: 'phrase' }

jest.mock('@xchainjs/xchain-crypto', () => ({
  encryptToKeyStore: () => mockEncrypt,
  decryptFromKeystore: () => Promise.resolve(mockDecrypt.phrase)
}))

// TODO(@veado) Fix test
describe.skip('services/keystore/service/', () => {
  it('removeKeystore', (done) => {
    removeKeystore().then(() =>
      keystoreService.keystore$
        .pipe(
          RxOp.tap((val) => {
            console.log('val:', val)
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
      await expect(keystoreService.unlock(password)).rejects.toBeTruthy()
    })

    it('should call setKeystoreState', (done) => {
      keystoreService.unlock(password).then(() => {
        keystoreService.keystore$
          .pipe(
            RxOp.tap((val) => {
              console.log('val:', val)
              expect(val).toEqual(O.some(mockDecrypt))
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
          RxOp.tap((val) => {
            console.log('val:', val)
            expect(val).toEqual(O.some({ id: MOCK_KS_ID, phrase }))
            done()
          })
        )
        .subscribe()
    })
  })
})
