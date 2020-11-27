import { Keystore } from '@xchainjs/xchain-crypto'

import { Locale } from '../../shared/i18n/types'

export type ApiKeystore = {
  save: (keystore: Keystore) => Promise<void>
  remove: () => Promise<void>
  get: () => Promise<Keystore>
  exists: () => Promise<boolean>
}

export type ApiLang = {
  update: (locale: Locale) => void
}

export type ApiUrl = {
  openExternal: (url: string) => Promise<void>
}

export type LedgerAddressResponse = {
  result: string
  error?: Error
}

export type ApiHDWallet = {
  getBTCAddress: () => Promise<LedgerAddressResponse>
}

declare global {
  interface Window {
    apiKeystore: ApiKeystore
    apiLang: ApiLang
    apiUrl: ApiUrl
    apiHDWallet: ApiHDWallet
  }
}
