import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@thorchain/asgardex-bitcoin'
import { FeeOptions } from '@thorchain/asgardex-bitcoin/lib/types/client-types'
import { BaseAmount } from '@thorchain/asgardex-util'
import * as Rx from 'rxjs'

import { LiveData } from '../../helpers/rx/liveData'
import { ClientState } from '../types'
import { ApiError } from '../wallet/types'

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
  fees$: FeesLD
  reloadFees: () => void
  resetTx: () => void
}
