import { envOrDefault } from '../renderer/helpers/envHelper'
import { StoreFilesContent } from './api/types'
import { Locale } from './i18n/types'

export const IS_PRODUCTION = envOrDefault(process.env.NODE_ENV, '') === 'production'

export enum ExternalUrl {
  WEBSITE = 'https://thorchain.org',
  DOCS = 'https://docs.thorchain.org/',
  TELEGRAM = 'https://t.me/thorchain_org',
  GITHUB = 'https://github.com/thorchain',
  GITHUB_REPO = `https://github.com/thorchain/asgardex-electron`,
  TWITTER = 'https://twitter.com/thorchain_org'
}

/**
 * When adding a new store file do not forget to expose
 * public api for it at src/main/preload.ts
 */
export const STORE_FILES_DEFAULTS: StoreFilesContent = {
  commonStorage: { locale: Locale.EN }
}
