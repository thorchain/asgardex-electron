import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Client, EstimatedFee, FeeParams } from '@xchainjs/xchain-terra'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'

import { WalletType } from '../../../shared/wallet/types'
import { LiveData } from '../../helpers/rx/liveData'
import { FeesLD, Memo } from '../chain/types'
import * as C from '../clients'
import { TxHashLD } from '../wallet/types'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type FeesService = {
  reloadFees: (params: O.Option<FeeParams>) => void
  fees$: (params: FeeParams) => FeesLD
  estimatedFees$: (params: FeeParams) => EstimatedFeeLD
}

export type SendTxParams = {
  walletType: WalletType
  asset: Asset
  recipient: Address
  amount: BaseAmount
  feeAsset: Asset
  feeAmount: BaseAmount
  gasLimit: BigNumber
  memo: Memo
  walletIndex: number
}

export type SendPoolTxParams = Omit<SendTxParams, 'feeAsset' | 'gasLimit' | 'feeAmount'>

export type TransactionService = {
  sendPoolTx$: (params: SendPoolTxParams) => TxHashLD
} & C.TransactionService<SendTxParams>

export type EstimatedFeeRD = RD.RemoteData<Error, EstimatedFee>
export type EstimatedFeeLD = LiveData<Error, EstimatedFee>
