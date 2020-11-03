import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@xchainjs/xchain-bitcoin'
import { FeeOptions } from '@xchainjs/xchain-bitcoin/lib/types/client-types'
import { BaseAmount } from '@xchainjs/xchain-util'
import * as Rx from 'rxjs'

import { LiveData } from '../../helpers/rx/liveData'
import { FeeLD, Memo } from '../chain/types'
import { ClientState } from '../types'
import { ApiError, TxsPageLD } from '../wallet/types'

export type BitcoinClientState = ClientState<BitcoinClient>
export type BitcoinClientState$ = Rx.Observable<ClientState<BitcoinClient>>

export type FeesRD = RD.RemoteData<Error, FeeOptions>
export type FeesLD = LiveData<Error, FeeOptions>

export type AddressValidation = BitcoinClient['validateAddress']

export type SendTxParams = {
  to: string // to address
  amount: BaseAmount
  feeRate: number
  memo?: string
}

export type TransactionService = {
  txRD$: LiveData<ApiError, string>
  pushTx: (p: SendTxParams) => Rx.Subscription
  resetTx: () => void
  assetTxs$: TxsPageLD
  loadAssetTxs: () => void
}

export type FeesService = {
  fees$: FeesLD
  stakeFee$: (memo: Memo) => FeeLD
  reloadFees: () => void
  reloadStakeFee: () => void
}
