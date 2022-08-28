import * as RD from '@devexperts/remote-data-ts'
import { Address, FeeOption, Fees, Tx } from '@xchainjs/xchain-client'
import { Asset, BaseAmount, Chain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { Network } from '../../../shared/api/types'
import { WalletType, WalletAddress, HDMode } from '../../../shared/wallet/types'
import { LiveData } from '../../helpers/rx/liveData'
import { AssetWithDecimal } from '../../types/asgardex'
import { AssetWithAmount } from '../../types/asgardex'
import { PoolAddress } from '../midgard/types'
import { ApiError, TxHashRD } from '../wallet/types'

export type TxTypes = 'DEPOSIT' | 'SWAP' | 'WITHDRAW' | 'UPGRADE' | 'APPROVE' | 'SEND'

export type Chain$ = Rx.Observable<O.Option<Chain>>

export type AssetWithDecimalLD = LiveData<Error, AssetWithDecimal>
export type AssetWithDecimalRD = RD.RemoteData<Error, AssetWithDecimal>

export type LoadFeesHandler = () => void

export type FeeRD = RD.RemoteData<Error, BaseAmount>
export type FeeLD = LiveData<Error, BaseAmount>

export type FeesRD = RD.RemoteData<Error, Fees>
export type FeesLD = LiveData<Error, Fees>

export type Memo = string
export type MemoRx = Rx.Observable<O.Option<Memo>>

export type SymDepositMemo = { rune: Memo; asset: Memo }

export type SymDepositAddresses = {
  asset: O.Option<WalletAddress>
  rune: O.Option<WalletAddress>
}

export type DepositFees = { inFee: BaseAmount; outFee: BaseAmount; refundFee: BaseAmount }
export type DepositAssetFees = DepositFees & { asset: Asset }
/**
 * Sym. deposit fees
 *
 */
export type SymDepositFees = {
  /** fee for RUNE txs */
  readonly rune: DepositFees
  /** fee for asset txs */
  readonly asset: DepositAssetFees
}

export type SymDepositFeesRD = RD.RemoteData<Error, SymDepositFees>
export type SymDepositFeesLD = LiveData<Error, SymDepositFees>

export type SymDepositFeesParams = {
  readonly asset: Asset
}

export type SymDepositFeesHandler = (asset: Asset) => SymDepositFeesLD
export type ReloadSymDepositFeesHandler = (asset: Asset) => void

export type AsymDepositParams = {
  readonly poolAddress: PoolAddress
  readonly asset: Asset
  readonly amount: BaseAmount
  readonly memo: string
  readonly walletIndex: number
  readonly walletType: WalletType
  readonly hdMode: HDMode
}

export type SymDepositAmounts = { rune: BaseAmount; asset: BaseAmount }

export type SymDepositParams = {
  readonly poolAddress: PoolAddress
  readonly asset: Asset
  readonly amounts: SymDepositAmounts
  readonly memos: SymDepositMemo
  readonly runeWalletType: WalletType
  readonly runeWalletIndex: number
  readonly runeHDMode: HDMode
  readonly runeSender: Address
  readonly assetWalletIndex: number
  readonly assetWalletType: WalletType
  readonly assetHDMode: HDMode
  readonly assetSender: Address
}

export type SendTxParams = {
  walletType: WalletType
  asset: Asset
  sender?: Address
  recipient: Address
  amount: BaseAmount
  memo: Memo
  feeOption?: FeeOption
  walletIndex: number
  feeAsset?: Asset
  gasLimit?: BigNumber
  feeAmount?: BaseAmount
  hdMode: HDMode
}

export type SendPoolTxParams = SendTxParams & {
  router: O.Option<Address>
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

/**
 * Parameters to send swap tx into (IN) a pool
 */
export type SwapTxParams = {
  readonly poolAddress: PoolAddress
  readonly asset: Asset
  readonly amount: BaseAmount
  readonly memo: string
  readonly walletType: WalletType
  readonly sender: Address
  readonly walletIndex: number
  readonly hdMode: HDMode
}

export type SwapStateHandler = (p: SwapTxParams) => SwapState$

/**
 * Types of swap txs
 **/

export type SwapTxType = 'in' | ' out'

export type SwapOutTx = {
  readonly asset: Asset
  readonly memo: Memo
}

export type PoolFeeLD = LiveData<Error, AssetWithAmount>

export type SwapFees = {
  /** Inbound tx fee */
  readonly inFee: AssetWithAmount
  /** Outbound tx fee */
  readonly outFee: AssetWithAmount
}

export type SwapFeesRD = RD.RemoteData<Error, SwapFees>
export type SwapFeesLD = LiveData<Error, SwapFees>

export type SwapFeesParams = {
  readonly inAsset: Asset
  readonly outAsset: Asset
}

export type SwapFeesHandler = (p: SwapFeesParams) => SwapFeesLD
export type ReloadSwapFeesHandler = (p: SwapFeesParams) => void

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

export type SymDepositStateHandler = (p: SymDepositParams) => SymDepositState$

export type WithdrawFees = {
  /** Inbound tx fee */
  inFee: BaseAmount
  /** Outbound tx fee */
  outFee: BaseAmount
}
export type WithdrawAssetFees = WithdrawFees & {
  /** fee asset */
  asset: Asset
}
/**
 * Withdraw fees
 */
export type SymWithdrawFees = {
  rune: WithdrawFees
  asset: AssetWithAmount
}

export type SymWithdrawFeesRD = RD.RemoteData<Error, SymWithdrawFees>
export type SymWithdrawFeesLD = LiveData<Error, SymWithdrawFees>

export type SymWithdrawFeesHandler = (asset: Asset) => SymWithdrawFeesLD
export type ReloadWithdrawFeesHandler = (asset: Asset) => void

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

export type SymWithdrawParams = {
  readonly memo: Memo
  readonly network: Network
  readonly walletType: WalletType
  readonly walletIndex: number
  readonly hdMode: HDMode
}

export type SymWithdrawStateHandler = (p: SymWithdrawParams) => WithdrawState$

export type AsymWithdrawParams = {
  readonly poolAddress: PoolAddress
  readonly asset: Asset
  readonly memo: Memo
  readonly network: Network
  readonly walletType: WalletType
  readonly walletIndex: number
  readonly hdMode: HDMode
}

export type AsymWithdrawStateHandler = (p: AsymWithdrawParams) => WithdrawState$

export type UpgradeRuneParams = {
  readonly walletAddress: string
  readonly walletType: WalletType
  readonly walletIndex: number
  readonly hdMode: HDMode
  readonly poolAddress: PoolAddress
  readonly asset: Asset
  readonly amount: BaseAmount
  readonly memo: string
  readonly network: Network
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
  readonly steps: { current: number; readonly total: 1 }
  // RD of all steps
  readonly status: TxHashRD
}

export type SendTxState$ = Rx.Observable<SendTxState>

export type SendTxStateHandler = (p: SendTxParams) => SendTxState$
