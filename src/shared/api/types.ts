import { Keystore } from '@thorchain/asgardex-crypto'

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

declare global {
  interface Window {
    apiKeystore: ApiKeystore
    apiLang: ApiLang
  }
}
