import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@xchainjs/xchain-bitcoin'
import { FeeRate, FeesWithRates } from '@xchainjs/xchain-bitcoin'
import { BaseAmount } from '@xchainjs/xchain-util'
import * as Rx from 'rxjs'

import { LiveData } from '../../helpers/rx/liveData'
import { FeeLD, Memo } from '../chain/types'
import { ClientState } from '../clients/types'
import { TxsPageLD, TxLD, LoadTxsProps } from '../wallet/types'

export type BitcoinClientState = ClientState<BitcoinClient>
export type BitcoinClientState$ = Rx.Observable<ClientState<BitcoinClient>>

export type FeeRateRD = RD.RemoteData<Error, FeeRate>
export type FeeRateLD = LiveData<Error, FeeRate>

export type FeesWithRatesRD = RD.RemoteData<Error, FeesWithRates>
export type FeesWithRatesLD = LiveData<Error, FeesWithRates>

export type AddressValidation = BitcoinClient['validateAddress']

export type SendTxParams = {
  to: string // to address
  amount: BaseAmount
  feeRate: number
  memo?: string
}

export type TransactionService = {
  txRD$: TxLD
  pushTx: (_: SendTxParams) => Rx.Subscription
  sendStakeTx: (p: SendTxParams) => TxLD
  resetTx: () => void
  txs$: (_: LoadTxsProps) => TxsPageLD
}

export type FeesService = {
  fees$: FeesWithRatesLD
  poolFee$: (memo: Memo) => FeeLD
  poolFeeRate$: (memo: Memo) => FeeRateLD
  getPoolFeeRate: () => FeeRateRD
  reloadFees: () => void
  reloadStakeFee: () => void
}
