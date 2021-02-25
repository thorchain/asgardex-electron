import * as RD from '@devexperts/remote-data-ts'
import { Client, FeesWithRates } from '@xchainjs/xchain-litecoin'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'

import { LiveData } from '../../helpers/rx/liveData'
import * as C from '../clients'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type FeesService = C.FeesService<undefined>

export type SendTxParams = {
  recipient: string
  amount: BaseAmount
  asset: Asset
  memo?: string
  feeRate: number
}

export type AddressValidation = Client['validateAddress']

export type FeesWithRatesRD = RD.RemoteData<Error, FeesWithRates>
export type FeesWithRatesLD = LiveData<Error, FeesWithRates>
export type TransactionService = C.TransactionService<SendTxParams>
