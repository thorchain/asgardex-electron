import * as RD from '@devexperts/remote-data-ts'
import { Address, TxHash, XChainClient } from '@xchainjs/xchain-client'
import { TxsPage, Fees } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { WalletAddress } from '../../../shared/wallet/types'
import { LiveData } from '../../helpers/rx/liveData'
import { ApiError, TxLD, WalletBalance } from '../wallet/types'
import { TxHashLD } from '../wallet/types'
/**
 * States:
 * (1) `initial` -> no client has been instantiated
 * (2) `pending -> A client is instantiated
 * (3) `success -> A client has been successfully instantiated
 * (4) `failure -> An error while trying to instantiate a client
 */
export type ClientState<C> = RD.RemoteData<Error, C>
export type ClientState$<C> = LiveData<Error, C>

export type XChainClient$ = Rx.Observable<O.Option<XChainClient>>

export type Client$<C> = Rx.Observable<O.Option<C>>

export type FeesRD = RD.RemoteData<Error, Fees>
export type FeesLD = LiveData<Error, Fees>

export type LoadTxsParams = {
  limit: number
  offset: number
}

export type TxsParams = { asset: O.Option<Asset>; walletAddress: O.Option<string>; walletIndex: number } & LoadTxsParams

export type TxsPageRD = RD.RemoteData<ApiError, TxsPage>
export type TxsPageLD = LiveData<ApiError, TxsPage>

export type WalletBalanceRD = RD.RemoteData<ApiError, WalletBalance>
export type WalletBalanceLD = LiveData<ApiError, WalletBalance>

export type WalletBalances = WalletBalance[]
export type WalletBalancesRD = RD.RemoteData<ApiError, WalletBalances>
export type WalletBalancesLD = LiveData<ApiError, WalletBalances>

export type ExplorerUrl$ = Rx.Observable<O.Option<string>>
export type OpenExplorerTxUrl = (txHash: string) => Promise<boolean>
export type GetExplorerTxUrl = (txHash: string) => O.Option<string>
export type OpenAddressUrl = (address: Address, params?: string) => Promise<boolean>
export type AddressValidation = (address: Address) => boolean
export type AddressValidationAsync = (address: Address) => Promise<boolean>

export type WalletAddress$ = Rx.Observable<O.Option<WalletAddress>>

export type TransactionService<T> = {
  txRD$: TxHashLD
  subscribeTx: (_: T) => Rx.Subscription
  sendTx: (_: T) => TxHashLD
  resetTx: () => void
  txs$: (_: TxsParams) => TxsPageLD
  tx$: (txHash: TxHash) => TxLD
  txStatus$: (txHash: TxHash, assetAddress: O.Option<Address>) => TxLD
}

/**
 *
 * FeesService
 *
 * According to the XChainClient's interface
 * `Client.getFees` accept an object of `FeeParams`, which might be overriden by clients.
 * @see https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-client/src/types.ts
 *
 * In common-client case, this parameter might be extended amd we need a generic type
 * to have an access to params "real" type value for specific chain
 * @example ETH client has extended `FeesParams` interface
 * @see https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-ethereum/src/types/client-types.ts
 */

export type FeesService = {
  reloadFees: () => void
  fees$: () => FeesLD
}
