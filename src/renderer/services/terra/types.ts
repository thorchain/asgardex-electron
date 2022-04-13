import { Address } from '@xchainjs/xchain-client'
import { Client, FeeParams } from '@xchainjs/xchain-terra'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { WalletType } from '../../../shared/wallet/types'
import { FeesLD, Memo } from '../chain/types'
import * as C from '../clients'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type FeesService = {
  reloadFees: (params: O.Option<FeeParams>) => void
  fees$: (params: FeeParams) => FeesLD
}

export type SendTxParams = {
  walletType: WalletType
  sender?: string
  asset: Asset
  feeAsset: Asset
  recipient: Address
  amount: BaseAmount
  memo: Memo
  walletIndex: number
}

export type TransactionService = C.TransactionService<SendTxParams>
