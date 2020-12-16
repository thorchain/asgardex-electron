import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import { getMonoid } from 'fp-ts/Array'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import { Observable } from 'rxjs'

import { LedgerErrorId } from '../../../shared/api/types'
import { LiveData } from '../../helpers/rx/liveData'
import { WalletBalance } from '../../types/wallet'
import { LoadTxsParams, WalletBalancesRD } from '../clients'

export type WalletType = 'keystore' | 'ledger'

export type Phrase = string

export type KeystoreContent = { phrase: Phrase }
/**
 * Type for providing 3 states of keystore
 *
 * (1) `None` -> DEFAULT (keystore needs to be imported at start of application or after shutdown of app)
 * (2) `Some<None>` -> LOCKED STATUS (keystore file, but no phrase)
 * (3) `Some<Some<KeystoreContent>>` -> UNLOCKED + IMPORTED STATUS (keystore file + phrase)
 */
export type KeystoreState = O.Option<O.Option<KeystoreContent>>

export type KeystoreService = {
  keystore$: Observable<KeystoreState>
  addKeystore: (phrase: Phrase, password: string) => Promise<void>
  removeKeystore: () => Promise<void>
  unlock: (state: KeystoreState, password: string) => Promise<void>
  lock: () => void
  /**
   * Use RemoteData as result of validation
   * No need to store any success data. Only status
   */
  validatePassword$: (password: string) => LiveData<Error, null>
}

/**
 * Wrapped WalletBalancesRD into an object to provide more information (address + chain)
 * Currently needed in `AssetView` - TODO(@Veado) Think about to extract it into view layer (as helper or so)
 */
export type ChainBalance = {
  walletType: WalletType
  walletAddress: O.Option<Address>
  chain: Chain
  balances: WalletBalancesRD
}

export type ChainBalance$ = Observable<ChainBalance>
export type ChainBalanceRD = RD.RemoteData<ApiError, ChainBalance>
export type ChainBalanceLD = LiveData<ApiError, ChainBalance>

export type ChainBalances = ChainBalance[]
export type ChainBalances$ = Observable<ChainBalances>
export type ChainBalancesRD = RD.RemoteData<ApiError, ChainBalances>
export type ChainBalancesLD = LiveData<ApiError, ChainBalances>

export const BalanceMonoid = getMonoid<WalletBalance>()

export type NonEmptyWalletBalances = NonEmptyArray<WalletBalance>

export type BalancesState = {
  balances: O.Option<NonEmptyWalletBalances>
  errors: O.Option<NonEmptyApiErrors>
  loading: boolean
}

export type LoadTxsHandler = (props: LoadTxsParams) => void
export type ResetTxsPageHandler = () => void

export type LoadBalancesHandler = () => void

export enum ErrorId {
  GET_BALANCES,
  GET_ASSET_TXS,
  SEND_TX,
  SEND_LEDGER_TX
}

// TODO(@Veado) Move type to clients/type

export type ApiError = {
  errorId: ErrorId
  msg: string
}

export type LedgerApiError = {
  ledgerErrorId?: LedgerErrorId
  errorId: ErrorId
  msg: string
}

export type NonEmptyApiErrors = NonEmptyArray<ApiError>

/* RD/LD for sending transactions on different chains */
export type TxRD = RD.RemoteData<ApiError, string>
export type TxLD = LiveData<ApiError, string>
export type LedgerTxRD = RD.RemoteData<LedgerApiError, string>
export type LedgerTxLD = LiveData<LedgerApiError, string>

export type LedgerAddressRD = RD.RemoteData<LedgerErrorId, Address>
export type LedgerAddressLD = LiveData<LedgerErrorId, Address>
