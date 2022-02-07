import * as RD from '@devexperts/remote-data-ts'
import { Client } from '@xchainjs/xchain-bitcoin'
import { Address, FeeRate, FeesWithRates } from '@xchainjs/xchain-client'
import { BaseAmount } from '@xchainjs/xchain-util'
import * as Rx from 'rxjs'

import { LedgerBTCTxInfo, Network } from '../../../shared/api/types'
import { WalletType } from '../../../shared/wallet/types'
import { LiveData } from '../../helpers/rx/liveData'
import { Memo } from '../chain/types'
import * as C from '../clients'
import { LedgerAddressLD, LedgerTxHashLD } from '../wallet/types'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type FeeRateRD = RD.RemoteData<Error, FeeRate>
export type FeeRateLD = LiveData<Error, FeeRate>

export type FeesWithRatesRD = RD.RemoteData<Error, FeesWithRates>
export type FeesWithRatesLD = LiveData<Error, FeesWithRates>

export type SendTxParams = {
  walletType: WalletType
  sender?: Address
  recipient: string
  amount: BaseAmount
  feeRate: number
  memo?: string
  walletIndex: number
}

export type TransactionService = C.TransactionService<SendTxParams>

export type FeesService = C.FeesService & {
  feesWithRates$: (memo?: Memo) => FeesWithRatesLD
  reloadFeesWithRates: (memo?: Memo) => void
}

export type LedgerService = {
  ledgerAddress$: LedgerAddressLD
  retrieveLedgerAddress: (network: Network, walletIndex: number) => void
  removeLedgerAddress: () => void
  ledgerTxRD$: LedgerTxHashLD
  pushLedgerTx: (network: Network, params: LedgerBTCTxInfo) => Rx.Subscription
  resetLedgerTx: () => void
}
