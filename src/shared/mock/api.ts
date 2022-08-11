import * as E from 'fp-ts/Either'

import { PoolsStorageEncoded } from '../api/io'
import { ApiLang, ApiKeystore, ApiUrl, ApiHDWallet, UserNodesStorage, IPCExportKeystoreParams } from '../api/types'
import { ApiFileStoreService, CommonStorage } from '../api/types'
import { Locale } from '../i18n/types'
import { MOCK_KEYSTORE } from './wallet'

// Mock "empty" `apiKeystore`
export const apiKeystore: ApiKeystore = {
  saveKeystoreWallets: (_) => Promise.resolve(),
  exportKeystore: (_: IPCExportKeystoreParams) => Promise.resolve(),
  load: () => Promise.resolve(MOCK_KEYSTORE),
  initKeystoreWallets: () => Promise.resolve(E.right([]))
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
  depositLedgerTx: () => Promise.resolve(E.right('tx_hash')),
  approveLedgerERC20Token: () => Promise.resolve(E.right('tx_hash'))
}

const commonStorageData: CommonStorage = {
  locale: Locale.EN,
  ethDerivationMode: 'ledgerlive',
  version: '1'
}

export const apiCommonStorage: ApiFileStoreService<CommonStorage> = {
  save: (_: Partial<CommonStorage>) => Promise.resolve(commonStorageData),
  remove: () => Promise.resolve(console.log('mock remove common storage data')),
  get: () => Promise.resolve(commonStorageData),
  exists: () => Promise.resolve(true)
}

const userNodeStorageData: UserNodesStorage = {
  mainnet: [],
  stagenet: [],
  testnet: [],
  version: '1'
}

export const apiUserNodesStorage: ApiFileStoreService<UserNodesStorage> = {
  save: (_: Partial<CommonStorage>) => Promise.resolve(userNodeStorageData),
  remove: () => Promise.resolve(console.log('mock remove user node storage data')),
  get: () => Promise.resolve(userNodeStorageData),
  exists: () => Promise.resolve(true)
}

const poolsStorageData: PoolsStorageEncoded = {
  watchlists: {
    mainnet: [],
    stagenet: [],
    testnet: []
  },
  version: '1'
}

export const apiPoolsStorage: ApiFileStoreService<PoolsStorageEncoded> = {
  save: (_: Partial<CommonStorage>) => Promise.resolve(poolsStorageData),
  remove: () => Promise.resolve(console.log('mock remove pools storage data')),
  get: () => Promise.resolve(poolsStorageData),
  exists: () => Promise.resolve(true)
}
