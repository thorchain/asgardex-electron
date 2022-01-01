import { StoreFilesContent, UserNodesStorage } from './api/types'
import { Locale } from './i18n/types'

export const IS_PRODUCTION = import.meta.env.PROD

export enum ExternalUrl {
  WEBSITE = 'https://thorchain.org',
  DOCS = 'https://docs.thorchain.org/',
  TELEGRAM = 'https://t.me/thorchain_org',
  GITHUB = 'https://github.com/thorchain',
  GITHUB_REPO = `https://github.com/thorchain/asgardex-electron`,
  GITHUB_RELEASE = `https://github.com/thorchain/asgardex-electron/releases/tag/v`,
  TWITTER = 'https://twitter.com/THORChain'
}

// increase it by `1` if you want to ignore previous version of `UserNodesStorage`
const USER_NODES_STORAGE_VERSION = '1'

export const USER_NODES_STORAGE_DEFAULT: UserNodesStorage = {
  version: USER_NODES_STORAGE_VERSION,
  mainnet: [],
  testnet: []
}

// increase it by `1` if you want to ignore previous version of `common` storage
const COMMON_STORAGE_VERSION = '1'
/**
 * When adding a new store file do not forget to expose
 * public api for it at src/main/preload.ts
 */
export const DEFAULT_STORAGES: StoreFilesContent = {
  common: { version: COMMON_STORAGE_VERSION, locale: Locale.EN },
  userNodes: USER_NODES_STORAGE_DEFAULT
}
