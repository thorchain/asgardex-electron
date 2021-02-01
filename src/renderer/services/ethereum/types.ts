import * as RD from '@devexperts/remote-data-ts'
import { FeeOptionKey } from '@xchainjs/xchain-client'
import { Address, Client, FeesParams, FeesWithGasPricesAndLimits } from '@xchainjs/xchain-ethereum'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'ethers'

import { LiveData } from '../../helpers/rx/liveData'
import * as C from '../clients'

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

export type TransactionService = C.TransactionService<SendTxParams>

export type FeesService = C.FeesService<FeesParams>
