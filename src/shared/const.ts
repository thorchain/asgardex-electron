import { StoreFilesContent, UserNodesStorage } from './api/types'
import { Locale } from './i18n/types'
import { envOrDefault } from './utils/env'

export const IS_PRODUCTION = envOrDefault(process.env.NODE_ENV, '') === 'production'

export enum ExternalUrl {
  WEBSITE = 'https://thorchain.org',
  DOCS = 'https://docs.thorchain.org',
  DISCORD = 'https://discord.gg/pHcS67yX7Z',
  GITHUB_REPO = `https://github.com/thorchain/asgardex-electron`,
  GITHUB_RELEASE = `https://github.com/thorchain/asgardex-electron/releases/tag/v`,
  TWITTER = 'https://twitter.com/asgardex'
}

// increase it by `1` if you want to ignore previous version of `UserNodesStorage`
const USER_NODES_STORAGE_VERSION = '1'

export const USER_NODES_STORAGE_DEFAULT: UserNodesStorage = {
  version: USER_NODES_STORAGE_VERSION,
  mainnet: [],
  stagenet: [],
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
