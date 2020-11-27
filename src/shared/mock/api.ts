import { Keystore } from '@xchainjs/xchain-crypto'
import { PubKeyEd25519 } from '@xchainjs/xchain-crypto/'
import * as E from 'fp-ts/Either'

import { ApiLang, ApiKeystore, ApiUrl, ApiHDWallet } from '../api/types'
import { Locale } from '../i18n/types'

// Mock "empty" `apiKeystore`
export const apiKeystore: ApiKeystore = {
  save: (_: Keystore) => Promise.resolve(),
  remove: () => Promise.resolve(),
  get: () =>
    Promise.resolve({
      address: '',
      publickeys: {
        ed25519: new PubKeyEd25519(Buffer.from('empty')),
        secp256k1: null
      },
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

// Mock `apiHDWallet`
export const apiHDWallet: ApiHDWallet = {
  getBTCAddress: () => Promise.resolve(E.right('btc_address'))
}
