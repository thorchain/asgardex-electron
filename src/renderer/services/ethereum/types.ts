import * as RD from '@devexperts/remote-data-ts'
import { FeeOptionKey } from '@xchainjs/xchain-client'
import { Address, Client, FeesParams, FeesWithGasPricesAndLimits } from '@xchainjs/xchain-ethereum'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import { BigNumber, ethers } from 'ethers'

import { LiveData } from '../../helpers/rx/liveData'
import { Memo } from '../chain/types'
import * as C from '../clients'
import { PoolAddress } from '../midgard/types'
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

export type DepositParams = {
  router: Address
  poolAddress: PoolAddress
  asset: Asset
  amount: BaseAmount
  memo: Memo
}

export type CallFeeParams = {
  address: Address
  abi: ethers.ContractInterface
  func: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Array<any>
}

export type IsApprovedRD = RD.RemoteData<ApiError, boolean>
export type IsApprovedLD = LiveData<ApiError, boolean>

export type TransactionService = {
  sendDepositTx$: (params: DepositParams) => TxHashLD
  approveERC20Token$: (params: ApproveParams) => TxHashLD
  isApprovedERC20Token$: (params: ApproveParams) => LiveData<ApiError, boolean>
} & C.TransactionService<SendTxParams>

export type FeesService = {
  callFees$: (params: CallFeeParams) => C.FeesLD
  outTxFee$: (asset: Asset) => C.FeesLD
} & C.FeesService<FeesParams>
