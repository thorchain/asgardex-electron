import { PoolsStorageEncoded } from './api/io'
import { StoreFilesContent, UserNodesStorage } from './api/types'
import { DEFAULT_ETH_HD_MODE } from './ethereum/const'
import { DEFAULT_LOCALE } from './i18n/const'

export enum ExternalUrl {
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
const POOLS_STORAGE_VERSION = '1'

const POOLS_STORAGE_DEFAULT: PoolsStorageEncoded = {
  version: POOLS_STORAGE_VERSION,
  watchlists: {
    mainnet: [],
    stagenet: [],
    testnet: []
  }
}

// increase it by `1` if you want to ignore previous version of `common` storage
const COMMON_STORAGE_VERSION = '1'
/**
 * When adding a new store file do not forget to expose
 * public api for it at src/main/preload.ts
 */
export const DEFAULT_STORAGES: StoreFilesContent = {
  common: { version: COMMON_STORAGE_VERSION, ethDerivationMode: DEFAULT_ETH_HD_MODE, locale: DEFAULT_LOCALE },
  userNodes: USER_NODES_STORAGE_DEFAULT,
  pools: POOLS_STORAGE_DEFAULT
}
