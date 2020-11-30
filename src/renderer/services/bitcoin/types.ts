import * as RD from '@devexperts/remote-data-ts'
import { Client } from '@xchainjs/xchain-bitcoin'
import { FeeRate, FeesWithRates } from '@xchainjs/xchain-bitcoin'
import { BaseAmount } from '@xchainjs/xchain-util'

import { LiveData } from '../../helpers/rx/liveData'
import { FeeLD, Memo } from '../chain/types'
import * as C from '../clients'
import { LedgerAddressLD } from '../wallet/types'

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
export type FeesService = {
  fees$: FeesWithRatesLD
  poolFee$: (memo: Memo) => FeeLD
  poolFeeRate$: (memo: Memo) => FeeRateLD
  getPoolFeeRate: () => FeeRateRD
  reloadFees: () => void
  reloadDepositFee: () => void
}

export type LedgerService = {
  ledgerAddress$: LedgerAddressLD
  retrieveLedgerAddress: () => void
  removeLedgerAddress: () => void
}
