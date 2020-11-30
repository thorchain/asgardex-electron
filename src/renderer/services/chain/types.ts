import * as RD from '@devexperts/remote-data-ts'
import { Fees } from '@xchainjs/xchain-client'
import { Asset, BaseAmount, Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { Network } from '../../../shared/api/types'
import { LiveData } from '../../helpers/rx/liveData'

export type Chain$ = Rx.Observable<O.Option<Chain>>

export type LoadFeesHandler = () => void

export type FeeRD = RD.RemoteData<Error, BaseAmount>
export type FeeLD = LiveData<Error, BaseAmount>

export type FeesRD = RD.RemoteData<Error, Fees>
export type FeesLD = LiveData<Error, Fees>

export type Memo = string
export type MemoRx = Rx.Observable<O.Option<Memo>>

export type SymDepositMemo = { rune: Memo; asset: Memo }
export type SymDepositMemoRx = Rx.Observable<O.Option<SymDepositMemo>>

/**
 * Deposit fees
 *
 * For deposits we do need one or two fees:
 *
 * base: Fee for "base-chain" pool (base chain is the chain where RUNE is running)
 * cross: Fee for a cross "pool-chain" (for cross-chain deposits only - it will be `none` in other case)
 */
export type DepositFees = { base: BaseAmount; cross: O.Option<BaseAmount> }
export type DepositFeesRD = RD.RemoteData<Error, DepositFees>
export type DepositFeesLD = LiveData<Error, DepositFees>

export type SendDepositTxParams = { chain: Chain; asset: Asset; poolAddress: string; amount: BaseAmount; memo: Memo }

export type WithdrawFee = BaseAmount
export type WithdrawFeeRD = RD.RemoteData<Error, WithdrawFee>
export type WithdrawFeeLD = LiveData<Error, WithdrawFee>

export type LedgerAddressParams = { chain: Chain; network: Network }
