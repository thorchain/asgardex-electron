import * as RD from '@devexperts/remote-data-ts'
import { Client } from '@xchainjs/xchain-bitcoin'
import { FeeRate, FeesWithRates } from '@xchainjs/xchain-bitcoin'
import { BaseAmount } from '@xchainjs/xchain-util'
import * as Rx from 'rxjs'

import { LedgerBTCTxInfo, Network } from '../../../shared/api/types'
import { LiveData } from '../../helpers/rx/liveData'
import { Memo } from '../chain/types'
import * as C from '../clients'
import { LedgerAddressLD, LedgerTxLD } from '../wallet/types'

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
  memoFees$: (memo: Memo) => FeesWithRatesLD
  reloadFees: () => void
}

export type LedgerService = {
  ledgerAddress$: LedgerAddressLD
  retrieveLedgerAddress: (network: Network) => void
  removeLedgerAddress: () => void
  ledgerTxRD$: LedgerTxLD
  pushLedgerTx: (network: Network, params: LedgerBTCTxInfo) => Rx.Subscription
  resetLedgerTx: () => void
}
