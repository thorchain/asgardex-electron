import { FeeRate } from '@xchainjs/xchain-bitcoin'
import { Address, TxParams } from '@xchainjs/xchain-client'
import { Keystore } from '@xchainjs/xchain-crypto'
import { Chain } from '@xchainjs/xchain-util'
import { Either } from 'fp-ts/lib/Either'

import { STORE_FILES } from '../const'
import { Locale } from '../i18n/types'

export type ApiKeystore = {
  save: (keystore: Keystore) => Promise<void>
  remove: () => Promise<void>
  get: () => Promise<Keystore>
  exists: () => Promise<boolean>
  export: (defaultFileName: string, keystore: Keystore) => Promise<void>
  load: () => Promise<Keystore>
}

export type StoreFileName = keyof typeof STORE_FILES
export type StoreFileData<FileName extends StoreFileName> = typeof STORE_FILES[FileName]

/**
 * Available public API interface to interact with files at the file system
 */
export type ApiFileStoreService<T> = {
  save: (data: T) => Promise<void>
  remove: () => Promise<void>
  get: () => Promise<T>
  exists: () => Promise<boolean>
}

export type ApiLang = {
  update: (locale: Locale) => void
}

export type ApiUrl = {
  openExternal: (url: string) => Promise<void>
}

export type Network = 'testnet' | 'chaosnet' | 'mainnet'

export enum LedgerErrorId {
  NO_DEVICE,
  ALREADY_IN_USE,
  NO_APP,
  WRONG_APP,
  DENIED,
  UNKNOWN
}

export type LedgerBNCTxInfo = TxParams & {
  sender: Address
}

export type LedgerBTCTxInfo = Pick<TxParams, 'amount' | 'recipient'> & {
  feeRate: FeeRate
  sender: Address
  nodeUrl: string
  nodeApiKey: string
}

export type LedgerTxInfo = LedgerBTCTxInfo | LedgerBNCTxInfo

export type ApiHDWallet = {
  getLedgerAddress: (chain: Chain, network: Network) => Promise<Either<LedgerErrorId, Address>>
  sendTxInLedger: (chain: Chain, network: Network, txInfo: LedgerTxInfo) => Promise<Either<LedgerErrorId, string>>
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
    apiConfig: ApiFileStoreService<StoreFileData<'config'>>
  }
}
