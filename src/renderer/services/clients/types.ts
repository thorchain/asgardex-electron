import * as RD from '@devexperts/remote-data-ts'
import { TxsPage, Balances, Fees } from '@xchainjs/xchain-client'

import { LiveData } from '../../helpers/rx/liveData'
import { ApiError } from '../wallet/types'

export type FeesRD = RD.RemoteData<Error, Fees>
export type FeesLD = LiveData<Error, Fees>

export type TxsPageRD = RD.RemoteData<ApiError, TxsPage>
export type TxsPageLD = LiveData<ApiError, TxsPage>

export type BalancesRD = RD.RemoteData<ApiError, Balances>
export type BalancesLD = LiveData<ApiError, Balances>

export type GetExplorerTxUrl = (txHash: string) => string
