import * as RD from '@devexperts/remote-data-ts'
import { Client } from '@xchainjs/xchain-bitcoincash'
import { FeeRate, FeesWithRates } from '@xchainjs/xchain-bitcoincash'
import { BaseAmount } from '@xchainjs/xchain-util'

import { LiveData } from '../../helpers/rx/liveData'
import { Memo } from '../chain/types'
import * as C from '../clients'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type FeeRateRD = RD.RemoteData<Error, FeeRate>
export type FeeRateLD = LiveData<Error, FeeRate>

export type FeesWithRatesRD = RD.RemoteData<Error, FeesWithRates>
export type FeesWithRatesLD = LiveData<Error, FeesWithRates>

export type AddressValidation = Client['validateAddress']

export type SendTxParams = {
  recipient: string // to address
  amount: BaseAmount
  feeRate: number
  memo?: string
}

export type TransactionService = C.TransactionService<SendTxParams>

export type FeesService = C.FeesService<undefined> & {
  feesWithRates$: (memo?: Memo) => FeesWithRatesLD
}
