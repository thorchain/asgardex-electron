import { Keystore } from '@xchainjs/xchain-crypto'

import { ApiLang, ApiKeystore, ApiUrl } from '../api/types'
import { Locale } from '../i18n/types'

// Mock "empty" `apiKeystore`
export const apiKeystore: ApiKeystore = {
  save: (_: Keystore) => Promise.resolve(),
  remove: () => Promise.resolve(),
  get: () =>
    Promise.resolve({
      address: '',
      crypto: {
        cipher: '',
        ciphertext: '',
        cipherparams: {
          iv: ''
        },
        kdf: '',
        kdfparams: {
          prf: '',
          dklen: 0,
          salt: '',
          c: 0
        },
        mac: ''
      },
      id: '',
      version: 0,
      meta: ''
    }),
  exists: () => Promise.resolve(true)
}

// Mock `apiLang`
export const apiLang: ApiLang = {
  update: (_: Locale) => {}
}

// Mock `apiUrl`
export const apiUrl: ApiUrl = {
  openExternal: (url: string) => Promise.resolve(console.log('openExternal called: ', url))
}
