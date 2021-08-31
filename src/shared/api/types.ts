import * as RD from '@devexperts/remote-data-ts'
import { Address, FeeRate, TxHash, TxParams } from '@xchainjs/xchain-client'
import { Keystore } from '@xchainjs/xchain-crypto'
import { ClientUrl as THORClientUrl } from '@xchainjs/xchain-thorchain'
import { Chain } from '@xchainjs/xchain-util'
import { Either } from 'fp-ts/lib/Either'
import * as O from 'fp-ts/Option'

import { Locale } from '../i18n/types'

// A version number starting from `1` to avoid to load deprecated files
export type StorageVersion = { version: string }
export type UserNodesStorage = Record<Network, Address[]> & StorageVersion
export type CommonStorage = Readonly<{ locale: Locale }> & StorageVersion

/**
 * Hash map of common store files
 * Record<fileName, defaultValues>
 * fileNames are available files to store data
 * @see StoreFileName
 */
export type StoreFilesContent = Readonly<{
  common: CommonStorage
  userNodes: UserNodesStorage
}>

export type StoreFileName = keyof StoreFilesContent
export type StoreFileData<FileName extends StoreFileName> = StoreFilesContent[FileName]

export type ApiKeystore = {
  save: (keystore: Keystore) => Promise<void>
  remove: () => Promise<void>
  get: () => Promise<Keystore>
  exists: () => Promise<boolean>
  export: (defaultFileName: string, keystore: Keystore) => Promise<void>
  load: () => Promise<Keystore>
}

/**
 * Available public API interface to interact with files at the file system
 */
export type ApiFileStoreService<T> = {
  // Returns new state
  save: (data: Partial<T>) => Promise<T>
  remove: () => Promise<void>
  get: () => Promise<T>
  exists: () => Promise<boolean>
}

// RemoteData itself tells us about the loading state
// Option inside of RD tells us if there is a new version after succeed checking for updates
export type AppUpdateRD = RD.RemoteData<Error, O.Option<string>>

// Promise with a version string inside
// If there is no new version Promise will be rejected
export type ApiAppUpdate = {
  checkForAppUpdates: () => Promise<AppUpdateRD>
}

export type ApiLang = {
  update: (locale: Locale) => void
}

export type ApiUrl = {
  openExternal: (url: string) => Promise<void>
}

export type Network = 'testnet' | 'mainnet'

export enum LedgerErrorId {
  NO_DEVICE,
  ALREADY_IN_USE,
  NO_APP,
  WRONG_APP,
  SIGN_FAILED,
  SEND_TX_FAILED,
  DENIED,
  UNKNOWN
}

export type LedgerBNBTxParams = TxParams & {
  sender: Address
}

export type LedgerTHORTxParams = TxParams & {
  sender: Address
  clientUrl: THORClientUrl
}

export type LedgerBTCTxInfo = Pick<TxParams, 'amount' | 'recipient'> & {
  feeRate: FeeRate
  sender: Address
  nodeUrl: string
  nodeApiKey: string
}

export type LedgerTxParams = LedgerTHORTxParams | LedgerBNBTxParams

export type IPCLedgerAdddressParams = { chain: Chain; network: Network }
export type IPCLedgerSendTxParams = { chain: Chain; network: Network; txParams: LedgerTxParams }

export type ApiHDWallet = {
  getLedgerAddress: (params: IPCLedgerAdddressParams) => Promise<Either<LedgerErrorId, Address>>
  sendLedgerTx: (params: IPCLedgerSendTxParams) => Promise<Either<LedgerErrorId, TxHash>>
}

declare global {
  interface Window {
    /**
     * When declaring anything from the electron-world do not forget to
     * expose appropriate API at the src/main/preload.ts
     */
    apiKeystore: ApiKeystore
    apiLang: ApiLang
    apiUrl: ApiUrl
    apiHDWallet: ApiHDWallet
    apiCommonStorage: ApiFileStoreService<StoreFileData<'common'>>
    apiUserNodesStorage: ApiFileStoreService<StoreFileData<'userNodes'>>
    apiAppUpdate: ApiAppUpdate
  }
}
