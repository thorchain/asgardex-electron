import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import {
  Asset,
  AssetRuneNative,
  BaseAmount,
  BCHChain,
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  ETHChain,
  LTCChain,
  PolkadotChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { eqBaseAmount, eqChain } from '../../../helpers/fp/eq'
import { sequenceSOption, sequenceTRDFromArray } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as BCH from '../../bitcoincash'
import * as ETH from '../../ethereum'
import * as LTC from '../../litecoin'
import { selectedPoolChain$ } from '../../midgard/common'
import * as THOR from '../../thorchain'
import { FeeLD, LoadFeesHandler, DepositFeesParams, DepositFeesLD, Memo } from '../types'

const reloadFeesByChain = (chain: Chain) => {
  switch (chain) {
    case BNBChain:
      return BNB.reloadFees
    case BTCChain:
      return BTC.reloadFees
    case BCHChain:
      return BCH.reloadFees
    case ETHChain:
      // reload ETH balances - not available yet
      return () => {}
    case THORChain:
      return THOR.reloadFees
    case LTCChain:
      return LTC.reloadFees
    default:
      return () => {}
  }
}

export const reloadFees$: Rx.Observable<O.Option<LoadFeesHandler>> = selectedPoolChain$.pipe(
  RxOp.map(O.map(reloadFeesByChain))
)

// State to reload deposit fees
const { get$: reloadDepositFees$, set: reloadDepositFees } = observableState<DepositFeesParams | undefined>(undefined)

type DepositByChainParams = {
  asset: Asset
  recipient?: O.Option<Address>
  amount?: O.Option<BaseAmount>
  memo?: O.Option<Memo>
}

const depositFeeByChain$ = ({
  asset: { chain },
  recipient = O.none,
  amount = O.none,
  memo = O.none
}: DepositByChainParams): FeeLD => {
  switch (chain) {
    case BNBChain:
      return BNB.fees$().pipe(liveData.map(({ fast }) => fast))
    case BTCChain: {
      // deposit fee for BTC txs based on a memo,
      // and memo depends on deposit type
      return FP.pipe(
        memo,
        O.fold(
          () => Rx.of(RD.initial),
          (memo) => BTC.feesWithRates$(memo).pipe(liveData.map(({ fees }) => fees.fast))
        )
      )
    }

    case THORChain: {
      return THOR.fees$().pipe(liveData.map(({ fast }) => fast))
    }
    case ETHChain: {
      return FP.pipe(
        sequenceSOption({ recipient, amount, memo }),
        O.fold(
          () => Rx.of(RD.initial),
          ({ recipient, amount, memo }) =>
            ETH.fees$({ recipient, amount, memo }).pipe(liveData.map((fees) => fees.fast))
        )
      )
    }
    case CosmosChain:
      return Rx.of(RD.failure(Error('Deposit fee for Cosmos has not been implemented')))
    case PolkadotChain:
      return Rx.of(RD.failure(Error('Deposit fee for Polkadot has not been implemented')))
    case BCHChain: {
      // deposit fee for BCH txs based on a memo,
      // and memo depends on deposit type
      return FP.pipe(
        memo,
        O.fold(
          () => Rx.of(RD.initial),
          (memo) => BCH.feesWithRates$(memo).pipe(liveData.map(({ fees }) => fees.fast))
        )
      )
    }
    case LTCChain: {
      // deposit fee for LTC txs based on a memo,
      // and memo depends on deposit type
      return FP.pipe(
        memo,
        O.fold(
          () => Rx.of(RD.initial),
          (memo) => LTC.feesWithRates$(memo).pipe(liveData.map(({ fees }) => fees.fast))
        )
      )
    }
  }
}

const depositFees$ = (initialParams: DepositFeesParams): DepositFeesLD =>
  FP.pipe(
    reloadDepositFees$,
    RxOp.debounceTime(300),
    RxOp.distinctUntilChanged((prev, next) => {
      if (prev && next) {
        /**
         * Pass values only in cases when:
         * 1 - chain was changed
         * 2 - Amount to deposit was changed. Some chains' fess depends on amount too (e.g. ETH)
         */
        return (
          // Check if entered chain was changed
          eqChain.equals(prev.asset.chain, next.asset.chain) &&
          // Check if entered amount was changed
          eqBaseAmount.equals(prev.amount, next.amount)
        )
      }
      return false
    }),
    RxOp.switchMap((params = initialParams) =>
      FP.pipe(
        Rx.combineLatest(
          params.type === 'asym'
            ? // for asym deposits, one tx needed at asset chain only == one fee)
              [
                depositFeeByChain$({
                  amount: O.some(params.amount),
                  memo: params.memo,
                  asset: params.asset,
                  recipient: params.recipient
                })
              ]
            : // for sym deposits, two txs at thorchain an asset chain needed == 2 fees,
              [
                depositFeeByChain$({
                  amount: O.some(params.amount),
                  memo: FP.pipe(
                    params.memos,
                    O.map(({ asset }) => asset)
                  ),
                  asset: params.asset,
                  recipient: params.recipient
                }),
                depositFeeByChain$({
                  asset: AssetRuneNative,
                  memo: FP.pipe(
                    params.memos,
                    O.map(({ rune }) => rune)
                  )
                })
              ]
        ),
        RxOp.map(sequenceTRDFromArray),
        liveData.map(([asset, thor]) => ({
          asset,
          thor: O.fromNullable(thor)
        }))
      )
    )
  )

export { depositFees$, reloadDepositFees, depositFeeByChain$ }
