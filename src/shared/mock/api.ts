import { Keystore } from '@xchainjs/xchain-crypto'
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
        ed25519: null,
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
  exists: () => Promise.resolve(true),
  export: () => Promise.resolve(),
  load: () =>
    Promise.resolve({
      address: '',
      publickeys: {
        ed25519: null,
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
    })
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
  getLedgerAddress: ({ chain }) =>
    Promise.resolve(E.right({ chain, address: 'ledger_address', type: 'ledger', walletIndex: 0 })),
  verifyLedgerAddress: () => Promise.resolve(true),
  sendLedgerTx: () => Promise.resolve(E.right('tx_hash')),
  depositLedgerTx: () => Promise.resolve(E.right('tx_hash'))
}
