import * as RD from '@devexperts/remote-data-ts'
import { Address, FeeOptionKey, Fees, Tx } from '@xchainjs/xchain-client'
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
export type SymDepositAmounts = { rune: BaseAmount; asset: BaseAmount }

export type AsymDepositFeesParams = {
  readonly asset: Asset
  readonly amount: BaseAmount
  readonly memo: O.Option<Memo>
  readonly recipient?: O.Option<Address>
  readonly type: 'asym'
}

export type SymDepositFeesParams = {
  readonly asset: Asset
  readonly amount: BaseAmount
  readonly memos: O.Option<SymDepositMemo>
  readonly recipient?: O.Option<Address>
  readonly type: 'sym'
}

export type DepositFeesParams = AsymDepositFeesParams | SymDepositFeesParams

export type DepositFeesHandler = (p: DepositFeesParams) => DepositFeesLD

export type LoadDepositFeesHandler = (p: DepositFeesParams) => void

export type SendDepositTxParams = { chain: Chain; asset: Asset; poolAddress: string; amount: BaseAmount; memo: Memo }

export type SendTxParams = {
  asset: Asset
  recipient: string
  amount: BaseAmount
  memo: Memo
  txType: TxTypes
  feeOptionKey?: FeeOptionKey
}

export type LedgerAddressParams = { chain: Chain; network: Network }

/**
 * State to reflect status of a swap by doing different requests
 */
export type SwapState = {
  // Number of current step
  readonly step: number
  // Constant total amount of steps
  readonly stepsTotal: 3
  // swap transaction
  readonly swapTx: TxHashRD
  // RD of all requests
  readonly swap: RD.RemoteData<ApiError, boolean>
}

export type SwapState$ = Rx.Observable<SwapState>

export type SwapParams = {
  readonly poolAddress: Address
  readonly routerAddress: O.Option<Address>
  readonly asset: Asset
  readonly amount: BaseAmount
  readonly memo: string
}

export type SwapStateHandler = (p: SwapParams) => SwapState$

export type SwapFeeParams = {
  readonly recipient: Address
  readonly routerAddress: O.Option<Address>
  readonly asset: Asset
  readonly amount: BaseAmount
  readonly memo?: Memo
}

export type SwapFeesParams = {
  readonly source: SwapFeeParams
  readonly target: SwapFeeParams
}

export type SwapFeesHandler = (p: SwapFeesParams) => SwapFeesLD

export type LoadSwapFeesHandler = (p: SwapFeesParams) => void

/**
 * State to reflect status of an asym. deposit by doing different requests
 */
export type AsymDepositState = {
  // Number of current step
  readonly step: number
  // Constant total amount of steps
  readonly stepsTotal: 3
  // deposit transaction
  readonly depositTx: TxHashRD
  // RD of all requests
  readonly deposit: RD.RemoteData<ApiError, boolean>
}

export type AsymDepositState$ = Rx.Observable<AsymDepositState>

export type AsymDepositParams = {
  readonly poolAddress: O.Option<Address>
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
  // Constant total amount of steps
  readonly stepsTotal: 4
  // deposit transactions
  readonly depositTxs: SymDepositTxs
  // RD for all needed steps
  readonly deposit: RD.RemoteData<ApiError, boolean>
}

export type SymDepositState$ = Rx.Observable<SymDepositState>

export type SymDepositParams = {
  readonly poolAddress: O.Option<string>
  readonly asset: Asset
  readonly amounts: SymDepositAmounts
  readonly memos: SymDepositMemo
}

export type SymDepositStateHandler = (p: SymDepositParams) => SymDepositState$

/**
 * State to reflect status of a sym. deposit by doing different requests
 */
export type WithdrawState = {
  // Number of current step
  readonly step: number
  // Constant total amount of steps
  readonly stepsTotal: 3
  // withdraw transaction
  readonly withdrawTx: TxHashRD
  // RD for all needed steps
  readonly withdraw: RD.RemoteData<ApiError, boolean>
}

export type WithdrawState$ = Rx.Observable<WithdrawState>

export type WithdrawParams = {
  readonly poolAddress: O.Option<string>
  readonly asset: Asset
  readonly memo: Memo
  readonly network: Network
}

export type WithdrawStateHandler = (p: WithdrawParams) => WithdrawState$

export type UpgradeRuneParams = {
  readonly poolAddress: O.Option<string>
  readonly asset: Asset
  readonly amount: BaseAmount
  readonly memo: string
}

/**
 * State to reflect status for upgrading Rune
 *
 * Three steps are needed:
 * 1. Health check (pool address)
 * 1. Send tx
 * 2. Check status of tx
 *
 */
export type UpgradeRuneTxState = {
  // State of steps (current step + total number of steps)
  readonly steps: { current: number; readonly total: 3 }
  // RD of all steps
  readonly status: TxHashRD
}

export type UpgradeRuneTxState$ = Rx.Observable<UpgradeRuneTxState>

/**
 * State to reflect status for sending
 *
 * Three steps are needed:
 * 1. Send tx
 * 2. Check status of tx
 *
 */
export type SendTxState = {
  // State of steps (current step + total number of steps)
  readonly steps: { current: number; readonly total: 2 }
  // RD of all steps
  readonly status: TxHashRD
}

export type SendTxState$ = Rx.Observable<SendTxState>

export type SendTxStateHandler = (p: SendTxParams) => SendTxState$
