import { none, some } from 'fp-ts/lib/Option'
import { Subscription } from 'rxjs'
import { tap } from 'rxjs/operators'
import { vi, expect, describe } from 'vitest'

import { removeKeystore, keystoreService } from './keystore'

const phrase = 'phrase'
const password = 'password'
const mockEncrypt = { encrypt: 'info' }
const mockDecrypt = { phrase }

vi.mock('@xchainjs/xchain-crypto', async () => ({
  encryptToKeyStore: () => Promise.resolve(mockEncrypt),
  decryptFromKeystore: () => Promise.resolve(mockDecrypt.phrase)
}))

describe('services/keystore/service/', () => {
  let sub: Subscription
  afterEach(() => {
    sub?.unsubscribe()
  })

  it('should reject if keystore is not imported', () => {
    expect(keystoreService.unlock(none, password)).rejects.toBeTruthy()
  })

  it('should call setKeystoreState', async () => {
    await keystoreService.unlock(some(some({ phrase })), password)
    sub = keystoreService.keystore$
      .pipe(
        tap((val) => {
          expect(val).toEqual(some(some(mockDecrypt)))
        })
      )
      .subscribe()
  })

  it('addKeystore', async () => {
    const removeKeystoreSpy = vi.spyOn(keystoreService, 'removeKeystore')
    removeKeystoreSpy.mockImplementationOnce(() => Promise.resolve())

    await keystoreService.addKeystore(phrase, password)

    sub = keystoreService.keystore$
      .pipe(
        tap((val) => {
          expect(val).toEqual(some(some({ phrase })))
        })
      )
      .subscribe()
  })

  it('removeKeystore', async () => {
    await removeKeystore()

    keystoreService.keystore$
      .pipe(
        tap((val) => {
          expect(val).toBeNone()
        })
      )
      .subscribe()
  })
})
