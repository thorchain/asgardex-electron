import * as RD from '@devexperts/remote-data-ts'
import { Balance, Tx, TxHash } from '@xchainjs/xchain-client'
import { Keystore } from '@xchainjs/xchain-crypto'
import { Address, Asset } from '@xchainjs/xchain-util'
import { getMonoid } from 'fp-ts/Array'
import * as FP from 'fp-ts/lib/function'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { KeystoreWallet, KeystoreWallets } from '../../../shared/api/io'
import { KeystoreId, LedgerError, Network } from '../../../shared/api/types'
import { Chain } from '../../../shared/utils/chain'
import { HDMode, WalletAddress, WalletBalanceType, WalletType } from '../../../shared/wallet/types'
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

export type RemovedKeystoreId$ = Rx.Observable<O.Option<KeystoreId>>

export type RenameKeystoreWalletRD = RD.RemoteData<Error, boolean>
export type RenameKeystoreWalletLD = LiveData<Error, boolean>
export type RenameKeystoreWalletHandler = (id: KeystoreId, name: string) => RenameKeystoreWalletLD

export type ChangeKeystoreWalletRD = RD.RemoteData<Error, boolean>
export type ChangeKeystoreWalletLD = LiveData<Error, boolean>
export type ChangeKeystoreWalletHandler = (id: KeystoreId) => ChangeKeystoreWalletLD

export type KeystoreService = {
  keystoreState$: KeystoreState$
  addKeystoreWallet: (params: AddKeystoreParams) => Promise<void>
  removeKeystoreWallet: RemoveKeystoreWalletHandler
  changeKeystoreWallet: ChangeKeystoreWalletHandler
  renameKeystoreWallet: RenameKeystoreWalletHandler
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
  reloadPersistentKeystoreWallets: FP.Lazy<void>
  keystoreWalletsPersistent$: KeystoreWalletsLD
  keystoreWalletsUI$: KeystoreWalletsUI$
  importingKeystoreState$: ImportingKeystoreStateLD
  resetImportingKeystoreState: FP.Lazy<void>
}

export type WalletAccount = {
  chain: Chain
  accounts: { keystore: WalletAddress; ledger: O.Option<WalletAddress> }
}

export type WalletAccounts = WalletAccount[]

export type WalletBalance = Balance & {
  walletAddress: Address
  walletType: WalletType
  walletIndex: number
  hdMode: HDMode
}
export type WalletBalances = WalletBalance[]

export type SelectedWalletAsset = {
  asset: Asset
  walletAddress: Address
  walletType: WalletType
  walletIndex: number
  hdMode: HDMode
}

export type SelectedWalletAssetRD = RD.RemoteData<Error, SelectedWalletAsset>
export type SelectedWalletAssetLD = LiveData<Error, SelectedWalletAsset>
/**
 * Wraps WalletBalancesRD into an object to provide extra information (`Address` + `Chain` + `WalletType` + `WalletBalanceType`)
 * Currently needed in `AssetView` only
 * TODO(@Veado) Think about to extract it into view layer (as helper or so)
 */
export type ChainBalance = {
  walletType: WalletType
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
  VALIDATE_POOL = 'VALIDATE_POOL',
  GET_NODE = 'GET_NODE',
  VALIDATE_NODE = 'VALIDATE_NODE',
  VALIDATE_RESULT = 'VALIDATE_RESULT',
  GET_ACTIONS = 'GET_ACTIONS',
  GET_TC_CONSTANT = 'GET_TC_CONSTANT'
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

export type GetLedgerAddressHandler = (chain: Chain) => Rx.Observable<O.Option<LedgerAddress>>

export type VerifiedLedgerAddressRD = RD.RemoteData<Error, boolean>
export type VerifiedLedgerAddressLD = LiveData<Error, boolean>
export type VerifyLedgerAddressHandler = ({
  chain,
  network,
  walletIndex,
  hdMode
}: {
  chain: Chain
  network: Network
  walletIndex: number
  hdMode: HDMode
}) => VerifiedLedgerAddressLD

export type AddLedgerAddressHandler = ({
  id,
  chain,
  network,
  walletIndex,
  hdMode
}: {
  id: KeystoreId
  chain: Chain
  network: Network
  walletIndex: number
  hdMode: HDMode
}) => LedgerAddressLD

export type RemoveLedgerAddressHandler = ({
  id,
  chain,
  network
}: {
  id: KeystoreId
  chain: Chain
  network: Network
}) => LedgerAddressesLD

export type LedgerService = {
  currentLedgerAddresses$: LedgerAddresses$
  addLedgerAddress$: AddLedgerAddressHandler
  getLedgerAddress$: GetLedgerAddressHandler
  verifyLedgerAddress$: VerifyLedgerAddressHandler
  removeLedgerAddress: RemoveLedgerAddressHandler
  persistentLedgerAddresses$: LedgerAddressesLD
  reloadPersistentLedgerAddresses: FP.Lazy<void>
}

// TODO(@Veado) Move type to clients/type

export type ApiError = {
  errorId: ErrorId
  statusCode?: number
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

export type LedgerAddress = Omit<WalletAddress, 'type'> & {
  readonly keystoreId: KeystoreId
  readonly network: Network
  readonly type: 'ledger'
}
export type LedgerAddressRD = RD.RemoteData<LedgerError, LedgerAddress>
export type LedgerAddressLD = LiveData<LedgerError, LedgerAddress>

export type LedgerAddresses = LedgerAddress[]
export type LedgerAddresses$ = Rx.Observable<LedgerAddresses>
export type LedgerAddressesRD = RD.RemoteData<Error, LedgerAddresses>
export type LedgerAddressesLD = LiveData<Error, LedgerAddresses>

export type KeystoreWalletsRD = RD.RemoteData<Error, KeystoreWallets>
export type KeystoreWalletsLD = LiveData<Error, KeystoreWallets>
export type KeystoreWallets$ = Rx.Observable<KeystoreWallets>

export type KeystoreWalletUI = Omit<KeystoreWallet, 'keystore'>
export type KeystoreWalletsUI = KeystoreWalletUI[]
export type KeystoreWalletsUI$ = Rx.Observable<KeystoreWalletsUI>
