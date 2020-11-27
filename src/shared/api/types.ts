import { Keystore } from '@xchainjs/xchain-crypto'
import { Either } from 'fp-ts/lib/Either'

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

export enum LedgerErrorId {
  NO_DEVICE,
  ALREADY_IN_USE,
  NO_APP,
  WRONG_APP,
  DENIED,
  UNKNOWN
}

export type ApiHDWallet = {
  getBTCAddress: () => Promise<Either<LedgerErrorId, string>>
}

declare global {
  interface Window {
    apiKeystore: ApiKeystore
    apiLang: ApiLang
    apiUrl: ApiUrl
    apiHDWallet: ApiHDWallet
  }
}
