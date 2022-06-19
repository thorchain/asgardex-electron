import { Address } from '@xchainjs/xchain-client'
import { Client } from '@xchainjs/xchain-cosmos'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'

import { WalletType } from '../../../shared/wallet/types'
import * as C from '../clients'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type SendTxParams = {
  walletType: WalletType
  sender?: Address
  recipient: Address
  amount: BaseAmount
  asset: Asset
  memo?: string
  walletIndex: number
}

export type TransactionService = C.TransactionService<SendTxParams>
