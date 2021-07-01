import * as RD from '@devexperts/remote-data-ts'
import { FeesWithRates } from '@xchainjs/xchain-client'
import { Client } from '@xchainjs/xchain-litecoin'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'

import { LiveData } from '../../helpers/rx/liveData'
import { Memo } from '../chain/types'
import * as C from '../clients'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type FeesWithRatesRD = RD.RemoteData<Error, FeesWithRates>
export type FeesWithRatesLD = LiveData<Error, FeesWithRates>

export type FeesService = C.FeesService<undefined> & {
  feesWithRates$: (memo?: string) => FeesWithRatesLD
  reloadFeesWithRates: (memo?: Memo) => void
}

export type SendTxParams = {
  recipient: string
  amount: BaseAmount
  asset: Asset
  memo?: string
  feeRate: number
}

export type AddressValidation = Client['validateAddress']

export type TransactionService = C.TransactionService<SendTxParams>
