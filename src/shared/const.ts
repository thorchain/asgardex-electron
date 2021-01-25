import { envOrDefault } from '../renderer/helpers/envHelper'
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
 * Hash map of common store files
 * Record<fileName, defaultValues>
 * fileName - will be available files to store data
 * @see StoreFileName type at the /src/shared/api/types.ts
 */
export const STORE_FILES = {
  config: { locale: Locale.EN }
} as const
