import { Client } from '@xchainjs/xchain-litecoin'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'

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

export type TransactionService = C.TransactionService<SendTxParams>
