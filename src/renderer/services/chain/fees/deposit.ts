import * as RD from '@devexperts/remote-data-ts'
import {
  AssetRuneNative,
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

import { sequenceSOption, sequenceTRDFromArray } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { triggerStream } from '../../../helpers/stateHelper'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as BCH from '../../bitcoincash'
import * as ETH from '../../ethereum'
import * as LTC from '../../litecoin'
import { selectedPoolChain$ } from '../../midgard/common'
import * as THOR from '../../thorchain'
import { symDepositAssetTxMemo$, asymDepositTxMemo$ } from '../memo'
import { FeeLD, LoadFeesHandler, DepositFeesParams, DepositFeesLD } from '../types'

export const reloadFees = () => {
  BNB.reloadFees()
  BTC.reloadFees()
  THOR.reloadFees()
  BCH.reloadFees()
}

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

// Trigger stream to reload deposit fees
const { stream$: reloadDepositFees$, trigger: reloadDepositFees } = triggerStream()

const depositFeeByChain$ = ({
  asset: { chain },
  type,
  recipient = O.none,
  amount = O.none
}: DepositFeesParams): FeeLD => {
  switch (chain) {
    case BNBChain:
      return BNB.fees$().pipe(liveData.map(({ fast }) => fast))
    case BTCChain:
      // deposit fee for BTC txs based on a memo,
      // and memo depends on deposit type
      return Rx.iif(() => type === 'asym', asymDepositTxMemo$, symDepositAssetTxMemo$).pipe(
        RxOp.switchMap((oMemo) =>
          FP.pipe(
            oMemo,
            O.fold(
              () => Rx.of(RD.initial),
              (memo) => BTC.feesWithRates$(memo).pipe(liveData.map(({ fees }) => fees.fast))
            )
          )
        )
      )
    case THORChain:
      return THOR.fees$().pipe(liveData.map(({ fast }) => fast))
    case ETHChain: {
      return Rx.iif(() => type === 'asym', asymDepositTxMemo$, symDepositAssetTxMemo$).pipe(
        RxOp.switchMap((oMemo) =>
          FP.pipe(
            oMemo,
            O.chain((memo) => sequenceSOption({ recipient, amount, memo: O.some(memo) })),
            O.fold(
              () => Rx.of(RD.initial),
              ({ recipient, amount, memo }) =>
                ETH.fees$({ recipient, amount, memo }).pipe(liveData.map((fees) => fees.fast))
            )
          )
        )
      )
    }
    case CosmosChain:
      return Rx.of(RD.failure(Error('Deposit fee for Cosmos has not been implemented')))
    case PolkadotChain:
      return Rx.of(RD.failure(Error('Deposit fee for Polkadot has not been implemented')))
    case BCHChain:
      // deposit fee for BCH txs based on a memo,
      // and memo depends on deposit type
      return Rx.iif(() => type === 'asym', asymDepositTxMemo$, symDepositAssetTxMemo$).pipe(
        RxOp.switchMap((oMemo) =>
          FP.pipe(
            oMemo,
            O.fold(
              () => Rx.of(RD.initial),
              (memo) => BCH.feesWithRates$(memo).pipe(liveData.map(({ fees }) => fees.fast))
            )
          )
        )
      )
    case LTCChain:
      // deposit fee for LTC txs based on a memo,
      // and memo depends on deposit type
      return Rx.iif(() => type === 'asym', asymDepositTxMemo$, symDepositAssetTxMemo$).pipe(
        RxOp.switchMap((oMemo) =>
          FP.pipe(
            oMemo,
            O.fold(
              () => Rx.of(RD.initial),
              (memo) => LTC.feesWithRates$(memo).pipe(liveData.map(({ fees }) => fees.fast))
            )
          )
        )
      )
  }
}

const depositFees$ = (params: DepositFeesParams): DepositFeesLD =>
  FP.pipe(
    reloadDepositFees$,
    RxOp.switchMap(() =>
      FP.pipe(
        Rx.combineLatest(
          params.type === 'asym'
            ? // for asym deposits, one tx needed at asset chain only == one fee)
              [depositFeeByChain$(params)]
            : // for sym deposits, two txs at thorchain an asset chain needed == 2 fees,
              [
                depositFeeByChain$(params),
                depositFeeByChain$({
                  asset: AssetRuneNative,
                  type: params.type,
                  memo: O.none
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
