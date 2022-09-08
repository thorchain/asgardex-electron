import * as RD from '@devexperts/remote-data-ts'
import { Address, FeeRate, TxHash, TxParams } from '@xchainjs/xchain-client'
import { Keystore } from '@xchainjs/xchain-crypto'
import { NodeUrl } from '@xchainjs/xchain-thorchain'
import { Chain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/Option'

import { EthHDMode } from '../ethereum/types'
import { Locale } from '../i18n/types'
import { HDMode, WalletAddress } from '../wallet/types'
import { IPCLedgerAddressesIO, KeystoreWallets, PoolsStorageEncoded } from './io'

export type Network = 'testnet' | 'stagenet' | 'mainnet'

// A version number starting from `1` to avoid to load deprecated files
export type StorageVersion = { version: string }
export type ApiUrls = Record<Network, string>
export type UserNodesStorage = Readonly<Record<Network, Address[]> & StorageVersion>
export type CommonStorage = Readonly<
  { locale: Locale; ethDerivationMode: EthHDMode; midgardUrls: ApiUrls } & StorageVersion
>

/**
 * Hash map of common store files
 * Record<fileName, defaultValues>
 * fileNames are available files to store data
 * @see StoreFileName
 */
export type StoreFilesContent = Readonly<{
  common: CommonStorage
  userNodes: UserNodesStorage
  pools: PoolsStorageEncoded
}>

export type StoreFileName = keyof StoreFilesContent
export type StoreFileData<FileName extends StoreFileName> = StoreFilesContent[FileName]

export type KeystoreId = number

export type IPCExportKeystoreParams = { fileName: string; keystore: Keystore }
export type IPCSaveKeystoreParams = { id: KeystoreId; keystore: Keystore }

export type ApiKeystore = {
  saveKeystoreWallets: (wallets: KeystoreWallets) => Promise<E.Either<Error, KeystoreWallets>>
  exportKeystore: (params: IPCExportKeystoreParams) => Promise<void>
  initKeystoreWallets: () => Promise<E.Either<Error, KeystoreWallets>>
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

export enum LedgerErrorId {
  NO_DEVICE = 'NO_DEVICE',
  ALREADY_IN_USE = 'ALREADY_IN_USE',
  APP_NOT_OPENED = 'APP_NOT_OPENED',
  NO_APP = 'NO_APP',
  SIGN_FAILED = 'SIGN_FAILED',
  SEND_TX_FAILED = 'SEND_TX_FAILED',
  DEPOSIT_TX_FAILED = 'DEPOSIT_TX_FAILED',
  DENIED = 'DENIED',
  INVALID_PUBKEY = 'INVALID_PUBKEY',
  INVALID_DATA = 'INVALID_DATA',
  REJECTED = 'REJECTED',
  TIMEOUT = 'TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  INVALID_ETH_DERIVATION_MODE = 'INVALID_ETH_DERIVATION_MODE',
  GET_ADDRESS_FAILED = 'GET_ADDRESS_FAILED',
  UNKNOWN = 'UNKNOWN'
}

export type LedgerError = {
  errorId: LedgerErrorId
  msg: string
}

export type LedgerBNBTxParams = TxParams & {
  sender: Address
}

export type LedgerTHORTxParams = TxParams & {
  sender: Address
  nodeUrl: NodeUrl
}

export type LedgerBTCTxInfo = Pick<TxParams, 'amount' | 'recipient'> & {
  feeRate: FeeRate
  sender: Address
}

export type LedgerLTCTxInfo = Pick<TxParams, 'amount' | 'recipient'> & {
  feeRate: FeeRate
  sender: Address
}

export type LedgerTxParams = LedgerTHORTxParams | LedgerBNBTxParams

export type IPCLedgerAdddressParams = {
  chain: Chain
  network: Network
  walletIndex: number
  hdMode: HDMode
}

export type ApiHDWallet = {
  getLedgerAddress: (params: IPCLedgerAdddressParams) => Promise<E.Either<LedgerError, WalletAddress>>
  verifyLedgerAddress: (params: IPCLedgerAdddressParams) => Promise<boolean>
  sendLedgerTx: (
    params: unknown /* will be de-/serialized by ipcLedgerSendTxParamsIO */
  ) => Promise<E.Either<LedgerError, TxHash>>
  depositLedgerTx: (
    params: unknown /* will be de-/serialized by ipcLedgerDepositTxParamsIO */
  ) => Promise<E.Either<LedgerError, TxHash>>
  approveLedgerERC20Token: (
    params: unknown /* will be de-/serialized by ipcLedgerApprovedERC20TokenParamsIO */
  ) => Promise<E.Either<LedgerError, TxHash>>
  saveLedgerAddresses: (params: IPCLedgerAddressesIO) => Promise<E.Either<Error, IPCLedgerAddressesIO>>
  getLedgerAddresses: () => Promise<E.Either<Error, IPCLedgerAddressesIO>>
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
    apiPoolsStorage: ApiFileStoreService<StoreFileData<'pools'>>
    apiAppUpdate: ApiAppUpdate
  }
}
