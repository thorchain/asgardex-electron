import * as RD from '@devexperts/remote-data-ts'
import { Address, FeesWithRates } from '@xchainjs/xchain-client'
import { Client } from '@xchainjs/xchain-litecoin'
import { BaseAmount } from '@xchainjs/xchain-util'

import { WalletType } from '../../../shared/wallet/types'
import { LiveData } from '../../helpers/rx/liveData'
import { Memo } from '../chain/types'
import * as C from '../clients'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type FeesWithRatesRD = RD.RemoteData<Error, FeesWithRates>
export type FeesWithRatesLD = LiveData<Error, FeesWithRates>

export type FeesService = C.FeesService & {
  feesWithRates$: (memo?: string) => FeesWithRatesLD
  reloadFeesWithRates: (memo?: Memo) => void
}

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
