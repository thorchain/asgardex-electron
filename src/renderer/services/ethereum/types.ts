import * as RD from '@devexperts/remote-data-ts'
import { FeeOptionKey } from '@xchainjs/xchain-client'
import { Address, Client, FeesParams, FeesWithGasPricesAndLimits } from '@xchainjs/xchain-ethereum'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'ethers'

import { LiveData } from '../../helpers/rx/liveData'
import * as C from '../clients'
import { ApiError, TxHashLD } from '../wallet/types'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type FeesWithGasPricesAndLimitsRD = RD.RemoteData<Error, FeesWithGasPricesAndLimits>
export type FeesWithGasPricesAndLimitsLD = LiveData<Error, FeesWithGasPricesAndLimits>

export type SendTxParams = {
  asset?: Asset
  recipient: Address
  amount: BaseAmount
  memo?: string
  feeOptionKey?: FeeOptionKey
  gasLimit?: BigNumber
  gasPrice?: BaseAmount
}

export type ApproveParams = {
  spender: Address
  sender: Address
  amount?: BaseAmount
}

export type IsApprovedRD = RD.RemoteData<ApiError, boolean>
export type IsApprovedLD = LiveData<ApiError, boolean>

export type TransactionService = {
  approveERC20Token$: (p: ApproveParams) => TxHashLD
  isApprovedERC20Token$: (params: ApproveParams) => LiveData<ApiError, boolean>
} & C.TransactionService<SendTxParams>

export type FeesService = C.FeesService<FeesParams>
