import { Address, Client } from '@xchainjs/xchain-ethereum'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'

import * as C from '../clients'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type AddressValidation = Client['validateAddress']

export type FeesService = {
  fees$: C.FeesLD
  reloadFees: () => void
}

export type SendTxParams = {
  recipient: Address
  amount: BaseAmount
  asset: Asset
  gasPrice?: BaseAmount
  memo?: string
}

export type TransactionService = C.TransactionService<SendTxParams>
