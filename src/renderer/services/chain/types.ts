import * as RD from '@devexperts/remote-data-ts'
import { FeeOptionKey, Fees, Tx } from '@xchainjs/xchain-client'
import { Asset, BaseAmount, Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { Network } from '../../../shared/api/types'
import { LiveData } from '../../helpers/rx/liveData'
import { TxTypes } from '../../types/asgardex'
import { ApiError, TxHashRD } from '../wallet/types'

export type Chain$ = Rx.Observable<O.Option<Chain>>

export type LoadFeesHandler = () => void

export type FeeRD = RD.RemoteData<Error, BaseAmount>
export type FeeLD = LiveData<Error, BaseAmount>

export type FeesRD = RD.RemoteData<Error, Fees>
export type FeesLD = LiveData<Error, Fees>

type SwapFees = {
  source: BaseAmount
  target: BaseAmount
}

export type SwapFeesRD = RD.RemoteData<Error, SwapFees>
export type SwapFeesLD = LiveData<Error, SwapFees>

export type Memo = string
export type MemoRx = Rx.Observable<O.Option<Memo>>

export type SymDepositMemo = { rune: Memo; asset: Memo }
export type SymDepositMemoRx = Rx.Observable<O.Option<SymDepositMemo>>

/**
 * Deposit fees
 *
 * For deposits we do need one fee (asymmetrical deposit) or two fees (symmetrical deposit):
 *
 * thor: Fee for transaction on Thorchain. Needed for sym deposit txs. It's `O.none` for asym deposit txs
 * asset: Fee for transaction on asset chain
 */
export type DepositFees = { thor: O.Option<BaseAmount>; asset: BaseAmount }
export type DepositFeesRD = RD.RemoteData<Error, DepositFees>
export type DepositFeesLD = LiveData<Error, DepositFees>

export type SendDepositTxParams = { chain: Chain; asset: Asset; poolAddress: string; amount: BaseAmount; memo: Memo }

export type SendTxParams = {
  asset: Asset
  recipient: string
  amount: BaseAmount
  memo: Memo
  txType: TxTypes
  feeOptionKey: FeeOptionKey
}

/**
 * Withdraw fees
 *
 * To withdraw we do need three fees:
 *
 * memo: Fee to send memo transaction on Thorchain
 * thorOut: Outbound transaction fee an user is charged for each outbound (withdraw). It's 3 times of `fast` fee.
 * assetOut : Outbound transaction fee an user is charged for each outbound (withdraw). It's 3 times of `fast` fee.
 */
export type WithdrawFees = { thorMemo: BaseAmount; thorOut: BaseAmount; assetOut: BaseAmount }
export type WithdrawFeesRD = RD.RemoteData<Error, WithdrawFees>
export type WithdrawFeesLD = LiveData<Error, WithdrawFees>

export type LedgerAddressParams = { chain: Chain; network: Network }

/**
 * State to reflect status of a swap by doing different requests
 */
export type SwapState = {
  // Number of current step
  readonly step: number
  // swap transaction
  readonly swapTx: TxHashRD
  // RD of all requests
  readonly swap: RD.RemoteData<ApiError, boolean>
}

export type SwapState$ = Rx.Observable<SwapState>

export type SwapParams = {
  readonly poolAddress: O.Option<string>
  readonly asset: Asset
  readonly amount: BaseAmount
  readonly memo: string
}

export type SwapStateHandler = (p: SwapParams) => SwapState$

/**
 * State to reflect status of an asym. deposit by doing different requests
 */
export type AsymDepositState = {
  // Number of current step
  readonly step: number
  // deposit transaction
  readonly depositTx: TxHashRD
  // RD of all requests
  readonly deposit: RD.RemoteData<ApiError, boolean>
}

export type AsymDepositState$ = Rx.Observable<AsymDepositState>

export type AsymDepositParams = {
  readonly poolAddress: O.Option<string>
  readonly asset: Asset
  readonly amount: BaseAmount
  readonly memo: string
}

export type AsymDepositStateHandler = (p: AsymDepositParams) => AsymDepositState$

export type SymDepositValidationResult = { pool: boolean; node: boolean }
export type SymDepositTxs = { rune: TxHashRD; asset: TxHashRD }
export type SymDepositFinalityResult = { rune: Tx; asset: Tx }

/**
 * State to reflect status of a sym. deposit by doing different requests
 */
export type SymDepositState = {
  // Number of current step
  readonly step: number
  // deposit transactions
  readonly depositTxs: SymDepositTxs
  // RD for all needed steps
  readonly deposit: RD.RemoteData<ApiError, boolean>
}

export type SymDepositState$ = Rx.Observable<SymDepositState>

export type SymDepositParams = {
  readonly poolAddress: O.Option<string>
  readonly asset: Asset
  readonly amounts: { rune: BaseAmount; asset: BaseAmount }
  readonly memos: SymDepositMemo
}

export type SymDepositStateHandler = (p: SymDepositParams) => SymDepositState$
