import * as RD from '@devexperts/remote-data-ts'
import { Address, XChainClient } from '@xchainjs/xchain-client'
import { TxsPage, Fees } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/lib/Either'
import { getEitherM } from 'fp-ts/lib/EitherT'
import * as O from 'fp-ts/lib/Option'
import { Option, option } from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { LiveData } from '../../helpers/rx/liveData'
import { WalletBalance } from '../../types/wallet'
import { ApiError } from '../wallet/types'
import { TxLD } from '../wallet/types'
/**
 * Three States:
 * (1) None -> no client has been instantiated
 * (2) Some(Right) -> A client has been instantiated
 * (3) Some(Left) -> An error while trying to instantiate a client
 */
export type ClientState<C> = Option<E.Either<Error, C>>
export type ClientState$<C> = Rx.Observable<ClientState<C>>

// Something like `EitherT<Option>` Monad
export const ClientStateM = getEitherM(option)

export type ClientStateForViews = 'notready' | 'ready' | 'error'

export type XChainClient$<T = XChainClient> = Rx.Observable<O.Option<T>>

export type Client$<C> = Rx.Observable<O.Option<C>>

export type FeesRD = RD.RemoteData<Error, Fees>
export type FeesLD = LiveData<Error, Fees>

export type LoadTxsParams = {
  limit: number
  offset: number
}

export type TxsParams = { asset: O.Option<Asset>; walletAddress: O.Option<string> } & LoadTxsParams

export type TxsPageRD = RD.RemoteData<ApiError, TxsPage>
export type TxsPageLD = LiveData<ApiError, TxsPage>

export type BalanceRD = RD.RemoteData<ApiError, WalletBalance>

export type WalletBalancesRD = RD.RemoteData<ApiError, WalletBalance[]>
export type WalletBalancesLD = LiveData<ApiError, WalletBalance[]>

export type ExplorerUrl$ = Rx.Observable<O.Option<string>>
export type GetExplorerTxUrl = (txHash: string) => string

export type GetExplorerTxUrl$ = Rx.Observable<O.Option<GetExplorerTxUrl>>

export type Address$ = Rx.Observable<O.Option<Address>>

export type TransactionService<SendTxParams> = {
  txRD$: TxLD
  pushTx: (_: SendTxParams) => Rx.Subscription
  sendDepositTx: (_: SendTxParams) => TxLD
  resetTx: () => void
  txs$: (_: TxsParams) => TxsPageLD
}
