import * as RD from '@devexperts/remote-data-ts'
import { FeeOptions } from '@thorchain/asgardex-bitcoin'
import { Client as BitcoinClient } from '@xchainjs/xchain-bitcoin'
import { BaseAmount } from '@xchainjs/xchain-util'
import * as Rx from 'rxjs'

import { LiveData } from '../../helpers/rx/liveData'
import { FeeLD, Memo } from '../chain/types'
import { TxsPageLD } from '../clients/types'
import { ClientState } from '../types'
import { ApiError, TxLD } from '../wallet/types'

export type BitcoinClientState = ClientState<BitcoinClient>
export type BitcoinClientState$ = Rx.Observable<ClientState<BitcoinClient>>

export type FeesRD = RD.RemoteData<Error, FeeOptions>
export type FeesLD = LiveData<Error, FeeOptions>

export type FeeRate = number
export type FeeRateRD = RD.RemoteData<Error, number>
export type FeeRateLD = LiveData<Error, number>

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
  sendStakeTx: (p: SendTxParams) => TxLD
  resetTx: () => void
  assetTxs$: TxsPageLD
  loadAssetTxs: () => void
}

export type FeesService = {
  fees$: FeesLD
  poolFee$: (memo: Memo) => FeeLD
  poolFeeRate$: (memo: Memo) => FeeRateLD
  getPoolFeeRate: () => FeeRateRD
  reloadFees: () => void
  reloadStakeFee: () => void
}
