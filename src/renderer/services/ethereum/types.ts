import * as RD from '@devexperts/remote-data-ts'
import { FeeOptionKey } from '@xchainjs/xchain-client'
import { Address, Client, FeesParams, FeesWithGasPricesAndLimits } from '@xchainjs/xchain-ethereum'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import { BigNumber, ethers } from 'ethers'

import { LiveData } from '../../helpers/rx/liveData'
import { FeeLD, SendPoolTxParams } from '../chain/types'
import * as C from '../clients'
import { ApiError, TxHashLD } from '../wallet/types'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type FeesWithGasPricesAndLimitsRD = RD.RemoteData<Error, FeesWithGasPricesAndLimits>
export type FeesWithGasPricesAndLimitsLD = LiveData<Error, FeesWithGasPricesAndLimits>

export type ApproveFeeHandler = (p: ApproveParams) => FeeLD

export type LoadApproveFeeHandler = (p: ApproveParams) => void

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
  walletIndex?: number
}

export type PollInTxFeeParams = {
  address: Address
  abi: ethers.ContractInterface
  func: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Array<any>
}

export type IsApprovedRD = RD.RemoteData<ApiError, boolean>
export type IsApprovedLD = LiveData<ApiError, boolean>

export type TransactionService = {
  sendPoolTx$: (params: SendPoolTxParams) => TxHashLD
  approveERC20Token$: (params: ApproveParams) => TxHashLD
  isApprovedERC20Token$: (params: ApproveParams) => LiveData<ApiError, boolean>
} & C.TransactionService<SendTxParams>

export type FeesService = {
  poolInTxFees$: (params: PollInTxFeeParams) => C.FeesLD
  poolOutTxFee$: (asset: Asset) => C.FeesLD
  approveFee$: ApproveFeeHandler
  reloadApproveFee: LoadApproveFeeHandler
} & C.FeesService<FeesParams>
