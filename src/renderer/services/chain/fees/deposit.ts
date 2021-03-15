import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { ETHAddress } from '@xchainjs/xchain-ethereum'
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

import { getEthChecksumAddress } from '../../../helpers/addressHelper'
import { getEthTokenAddress, isEthAsset } from '../../../helpers/assetHelper'
import { eqDepositFeesParams } from '../../../helpers/fp/eq'
import { sequenceSOption, sequenceTRDFromArray } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as BCH from '../../bitcoincash'
import { ethRouterABI } from '../../const'
import * as ETH from '../../ethereum'
import * as LTC from '../../litecoin'
import { selectedPoolChain$ } from '../../midgard/common'
import * as THOR from '../../thorchain'
import { FeeOptionKeys } from '../const'
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
  router?: O.Option<Address>
  amount?: O.Option<BaseAmount>
  memo?: O.Option<Memo>
}

const depositFeeByChain$ = ({
  asset,
  recipient = O.none,
  amount = O.none,
  memo = O.none,
  router = O.none
}: DepositByChainParams): FeeLD => {
  switch (asset.chain) {
    case BNBChain:
      return BNB.fees$().pipe(liveData.map(({ fast }) => fast))
    case BTCChain: {
      // deposit fee for BTC txs based on a memo,
      // and memo depends on deposit type
      return FP.pipe(
        memo,
        O.fold(
          () => Rx.of(RD.initial),
          (memo) => BTC.feesWithRates$(memo).pipe(liveData.map(({ fees }) => fees[FeeOptionKeys.DEPOSIT]))
        )
      )
    }

    case THORChain: {
      return THOR.fees$().pipe(liveData.map((fees) => fees[FeeOptionKeys.DEPOSIT]))
    }
    case ETHChain: {
      return FP.pipe(
        sequenceSOption({ recipient, router, amount, memo }),
        O.fold(
          () => Rx.of(RD.initial),
          ({ recipient, router, amount, memo }) =>
            ETH.poolInTxFees$({
              address: router,
              abi: ethRouterABI,
              func: 'deposit',
              params: isEthAsset(asset)
                ? [
                    FP.pipe(getEthChecksumAddress(recipient), O.toUndefined),
                    ETHAddress,
                    0,
                    memo,
                    {
                      value: amount.amount().toFixed()
                    }
                  ]
                : [
                    FP.pipe(getEthChecksumAddress(recipient), O.toUndefined),
                    FP.pipe(getEthTokenAddress(asset), O.toUndefined),
                    amount.amount().toFixed(),
                    memo
                  ]
            }).pipe(liveData.map((fees) => fees[FeeOptionKeys.DEPOSIT]))
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
          (memo) => BCH.feesWithRates$(memo).pipe(liveData.map(({ fees }) => fees[FeeOptionKeys.DEPOSIT]))
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
          (memo) => LTC.feesWithRates$(memo).pipe(liveData.map(({ fees }) => fees[FeeOptionKeys.DEPOSIT]))
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
        return eqDepositFeesParams.equals(prev, next)
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
                  recipient: params.recipient,
                  router: params.router
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
                  recipient: params.recipient,
                  router: params.router
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
