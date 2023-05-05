import * as Rx from 'rxjs'
import { Client, ClientUrl } from '@xchainjs/xchain-mayachain'
import { Address } from '@xchainjs/xchain-util'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'

import { HDMode, WalletType } from '../../../shared/wallet/types'
import * as C from '../clients'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>
export type ClientUrl$ = Rx.Observable<ClientUrl>

export type FeesService = C.FeesService

export type SendTxParams = {
  walletType: WalletType
  sender?: Address
  recipient: Address
  amount: BaseAmount
  asset: Asset
  memo?: string
  walletIndex: number
  hdMode: HDMode
  feeAmount: BaseAmount
}

export type TransactionService = C.TransactionService<SendTxParams>
