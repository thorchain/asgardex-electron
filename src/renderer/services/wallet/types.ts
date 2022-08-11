import * as RD from '@devexperts/remote-data-ts'
import { Address, Balance, Tx, TxHash } from '@xchainjs/xchain-client'
import { Keystore } from '@xchainjs/xchain-crypto'
import { Chain } from '@xchainjs/xchain-util'
import { getMonoid } from 'fp-ts/Array'
import * as FP from 'fp-ts/lib/function'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { KeystoreWallet, KeystoreWallets } from '../../../shared/api/io'
import { KeystoreId, LedgerError, Network } from '../../../shared/api/types'
import { WalletAddress, WalletBalanceType, WalletType } from '../../../shared/wallet/types'
import { LiveData } from '../../helpers/rx/liveData'
import { LoadTxsParams, WalletBalancesLD, WalletBalancesRD } from '../clients'

export type Phrase = string

export type KeystoreLocked = { id: KeystoreId; name: string }
export type KeystoreUnlocked = KeystoreLocked & { phrase: Phrase }
export type KeystoreContent = KeystoreLocked | KeystoreUnlocked

/**
 * Type guard for `KeystoreUnlocked`
 * Unlocked keystore will provide an id, phrase + name
 */
export const isKeystoreUnlocked = (kc: KeystoreContent): kc is KeystoreUnlocked =>
  'id' in kc && 'name' in kc && 'phrase' in kc

/**
 * Type guard for `KeystoreLocked`
 */
export const isKeystoreLocked = (kc: KeystoreContent): kc is KeystoreLocked => !isKeystoreUnlocked(kc)

/**
 * Type for providing 3 states of keystore
 *
 * (1) `None` -> DEFAULT (keystore needs to be imported at start of application or after shutdown of app)
 * (2) `Some<{id: string}>` -> LOCKED STATUS (keystore id, but no phrase)
 * (3) `Some<{id: string, phrase: string}>` -> UNLOCKED + IMPORTED STATUS (keystore id + phrase)
 *
 * DEPRECATED (2) `Some<None>` -> LOCKED STATUS (keystore file, but no phrase)
 * DEPRECATED (3) `Some<Some<KeystoreContent>>` -> UNLOCKED + IMPORTED STATUS (keystore file + phrase)
 *
 */
export type KeystoreState = O.Option<KeystoreContent>
export type KeystoreState$ = Rx.Observable<KeystoreState>

export type ValidatePasswordHandler = (password: string) => LiveData<Error, void>
export type ValidatePasswordLD = LiveData<Error, void>

export type ImportKeystoreParams = { id: KeystoreId; keystore: Keystore; password: string; name: string }
export type AddKeystoreParams = { id: KeystoreId; phrase: Phrase; name: string; password: string }
export type LoadKeystoreLD = LiveData<Error, Keystore>

export type ImportingKeystoreStateRD = RD.RemoteData<Error, boolean>
export type ImportingKeystoreStateLD = Rx.Observable<ImportingKeystoreStateRD>

export type RemoveKeystoreWalletHandler = () => Promise<number>
export type ChangeKeystoreWalletHandler = (id: KeystoreId) => Promise<void>

export type KeystoreService = {
  keystore$: KeystoreState$
  addKeystoreWallet: (params: AddKeystoreParams) => Promise<void>
  removeKeystoreWallet: RemoveKeystoreWalletHandler
  changeKeystoreWallet: ChangeKeystoreWalletHandler
  loadKeystore$: () => LoadKeystoreLD
  importKeystore: (params: ImportKeystoreParams) => Promise<void>
  exportKeystore: () => Promise<void>
  unlock: (password: string) => Promise<void>
  lock: FP.Lazy<void>
  /**
   * Use RemoteData as result of validation
   * No need to store any success data. Only status
   */
  validatePassword$: ValidatePasswordHandler
  reloadKeystoreWallets: FP.Lazy<void>
  keystoreWallets$: KeystoreWalletsLD
  keystoreWalletsUI$: KeystoreWalletsUI$
  importingKeystoreState$: ImportingKeystoreStateLD
  resetImportingKeystoreState: FP.Lazy<void>
}

export type WalletAddressAsync = { address: RD.RemoteData<Error, WalletAddress>; type: WalletType }
export type WalletAddressesAsync = WalletAddressAsync[]

export type WalletAccount = {
  chain: Chain
  accounts: WalletAddressesAsync
}

export type WalletAccounts = WalletAccount[]

export type WalletBalance = Balance & { walletAddress: Address; walletType: WalletType; walletIndex: number }
export type WalletBalances = WalletBalance[]

/**
 * Wraps WalletBalancesRD into an object to provide extra information (`Address` + `Chain` + `WalletType`)
 * Currently needed in `AssetView` - TODO(@Veado) Think about to extract it into view layer (as helper or so)
 */
export type ChainBalance = {
  walletType: WalletType
  walletIndex: number
  walletAddress: O.Option<Address>
  chain: Chain
  balances: WalletBalancesRD
  balancesType: WalletBalanceType
}

export type ChainBalance$ = Rx.Observable<ChainBalance>
export type ChainBalanceRD = RD.RemoteData<ApiError, ChainBalance>
export type ChainBalanceLD = LiveData<ApiError, ChainBalance>

export type ChainBalances = ChainBalance[]
export type ChainBalances$ = Rx.Observable<ChainBalances>
export type ChainBalancesRD = RD.RemoteData<ApiError, ChainBalances>
export type ChainBalancesLD = LiveData<ApiError, ChainBalances>

export const BalanceMonoid = getMonoid<WalletBalance>()

export type NonEmptyWalletBalances = NonEmptyArray<WalletBalance>

export type BalancesState = {
  balances: O.Option<NonEmptyWalletBalances>
  errors: O.Option<NonEmptyApiErrors>
  loading: boolean
}

export type BalancesStateFilter = Record<Chain, WalletBalanceType>
export type BalancesState$ = (filter: BalancesStateFilter) => Rx.Observable<BalancesState>

export type LoadTxsHandler = (props: LoadTxsParams) => void
export type ResetTxsPageHandler = FP.Lazy<void>

export type LoadBalancesHandler = FP.Lazy<void>

export enum ErrorId {
  GET_BALANCES = 'GET_BALANCES',
  GET_FEES = 'GET_FEES',
  GET_ASSET_TXS = 'GET_ASSET_TXS',
  SEND_TX = 'SEND_TX',
  SEND_LEDGER_TX = 'SEND_LEDGER_TX_ERROR',
  DEPOSIT_LEDGER_TX_ERROR = 'DEPOSIT_LEDGER_TX_ERROR',
  APPROVE_LEDGER_TX = 'APPROVE_LEDGER_TX',
  APPROVE_TX = 'APPROVE_TX',
  POOL_TX = 'POOL_TX',
  GET_TX = 'GET_TX',
  GET_NODE_INFO = 'GET_NODE_INFO',
  VALIDATE_POOL = 'VALIDATE_POOL',
  GET_NODE = 'GET_NODE',
  GET_LIQUIDITY_PROVIDERS = 'GET_LIQUIDITY_PROVIDERS',
  GET_THORNODE_API = 'GET_THORNODE_API',
  VALIDATE_NODE = 'VALIDATE_NODE',
  VALIDATE_RESULT = 'VALIDATE_RESULT',
  GET_ACTIONS = 'GET_ACTIONS',
  GET_POOL_CYCLE = 'GET_POOL_CYCLE'
}

export type ChainBalancesService = {
  reloadBalances: FP.Lazy<void>
  resetReloadBalances: FP.Lazy<void>
  reloadBalances$: Rx.Observable<boolean>
  balances$: WalletBalancesLD
}

export type BalancesService = {
  reloadBalances: FP.Lazy<void>
  reloadBalancesByChain: (chain: Chain) => FP.Lazy<void>
  chainBalances$: ChainBalances$
  balancesState$: BalancesState$
  dispose: FP.Lazy<void>
}

export type GetLedgerAddressHandler = (chain: Chain, network: Network) => LedgerAddressLD
export type VerifyLedgerAddressHandler = (params: {
  chain: Chain
  network: Network
  walletIndex: number
}) => Promise<boolean>

export type LedgerService = {
  ledgerAddresses$: Rx.Observable<LedgerAddressesMap>
  askLedgerAddress$: (chain: Chain, network: Network, walletIndex: number) => LedgerAddressLD
  getLedgerAddress$: GetLedgerAddressHandler
  verifyLedgerAddress: VerifyLedgerAddressHandler
  removeLedgerAddress: (chain: Chain, network: Network) => void
  dispose: FP.Lazy<void>
}

// TODO(@Veado) Move type to clients/type

export type ApiError = {
  errorId: ErrorId
  msg: string
}

export type NonEmptyApiErrors = NonEmptyArray<ApiError>

export type TxRD = RD.RemoteData<ApiError, Tx>
export type TxLD = LiveData<ApiError, Tx>

/* RD/LD for sending transactions on different chains */
export type TxHashRD = RD.RemoteData<ApiError, TxHash>
export type TxHashLD = LiveData<ApiError, TxHash>
export type LedgerTxHashRD = RD.RemoteData<LedgerError, TxHash>
export type LedgerTxHashLD = LiveData<LedgerError, TxHash>

export type LedgerAddressRD = RD.RemoteData<LedgerError, WalletAddress>
export type LedgerAddressLD = LiveData<LedgerError, WalletAddress>

export type LedgerAddressMap = Record<Network, LedgerAddressRD>
export type LedgerAddressMap$ = Rx.Observable<LedgerAddressMap>

export type LedgerAddressesMap = Record<Chain, LedgerAddressMap>
export type LedgerAddressesMap$ = Rx.Observable<LedgerAddressesMap>

export type KeystoreWalletsRD = RD.RemoteData<Error, KeystoreWallets>
export type KeystoreWalletsLD = LiveData<Error, KeystoreWallets>

export type KeystoreWalletUI = Omit<KeystoreWallet, 'keystore'>
export type KeystoreWalletsUI = KeystoreWalletUI[]
export type KeystoreWalletsUI$ = Rx.Observable<KeystoreWalletsUI>
