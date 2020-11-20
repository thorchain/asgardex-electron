import * as RD from '@devexperts/remote-data-ts'
import { XChainClient } from '@xchainjs/xchain-client'
import { TxsPage, Balances, Fees } from '@xchainjs/xchain-client'
import * as E from 'fp-ts/lib/Either'
import { getEitherM } from 'fp-ts/lib/EitherT'
import * as O from 'fp-ts/lib/Option'
import { Option, option } from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { LiveData } from '../../helpers/rx/liveData'
import { ApiError } from '../wallet/types'

/**
 * Three States:
 * (1) None -> no client has been instantiated
 * (2) Some(Right) -> A client has been instantiated
 * (3) Some(Left) -> An error while trying to instantiate a client
 */
export type ClientState<C> = Option<E.Either<Error, C>>

// Something like `EitherT<Option>` Monad
export const ClientStateM = getEitherM(option)

export type ClientStateForViews = 'notready' | 'ready' | 'error'

export type XChainClient$ = Rx.Observable<O.Option<XChainClient>>

export type FeesRD = RD.RemoteData<Error, Fees>
export type FeesLD = LiveData<Error, Fees>

export type TxsPageRD = RD.RemoteData<ApiError, TxsPage>
export type TxsPageLD = LiveData<ApiError, TxsPage>

export type BalancesRD = RD.RemoteData<ApiError, Balances>
export type BalancesLD = LiveData<ApiError, Balances>

export type ExplorerUrl$ = Rx.Observable<O.Option<string>>
export type GetExplorerTxUrl = (txHash: string) => string

export type GetExplorerTxUrl$ = Rx.Observable<O.Option<GetExplorerTxUrl>>
