import * as RD from '@devexperts/remote-data-ts'
import {
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

import { sequenceTRDFromArray } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { DepositType } from '../../../types/asgardex'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as LTC from '../../litecoin'
import { selectedPoolChain$ } from '../../midgard/common'
import * as THOR from '../../thorchain'
import { symDepositAssetTxMemo$, asymDepositTxMemo$ } from '../memo'
import { FeeLD, LoadFeesHandler, DepositFeesLD } from '../types'

export const reloadFees = () => {
  BNB.reloadFees()
  BTC.reloadFees()
  THOR.reloadFees()
}

const reloadFeesByChain = (chain: Chain) => {
  switch (chain) {
    case BNBChain:
      return BNB.reloadFees
    case BTCChain:
      return BTC.reloadFees
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
const { get$: reloadDepositFees$, set: reloadDepositFees } = observableState<DepositType>('asym')

const depositFeeByChain$ = (chain: Chain, type: DepositType): FeeLD => {
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
              (memo) => BTC.memoFees$(memo).pipe(liveData.map(({ fees }) => fees.fast))
            )
          )
        )
      )
    case THORChain:
      return THOR.fees$().pipe(liveData.map(({ fast }) => fast))
    case ETHChain:
      return Rx.of(RD.failure(Error('Deposit fee for ETH has not been implemented')))
    case CosmosChain:
      return Rx.of(RD.failure(Error('Deposit fee for Cosmos has not been implemented')))
    case PolkadotChain:
      return Rx.of(RD.failure(Error('Deposit fee for Polkadot has not been implemented')))
    case BCHChain:
      return Rx.of(RD.failure(Error('Deposit fee for Bitcoin Cash has not been implemented')))
    case LTCChain:
      return LTC.fees$().pipe(liveData.map(({ fast }) => fast))
  }
}

const depositFees$ = (type: DepositType): DepositFeesLD =>
  FP.pipe(
    Rx.combineLatest([selectedPoolChain$, reloadDepositFees$]),
    RxOp.switchMap(([oPoolChain]) =>
      FP.pipe(
        oPoolChain,
        O.map((chain) =>
          FP.pipe(
            Rx.combineLatest(
              type === 'asym'
                ? // for asym deposits, one tx needed at asset chain only == one fee)
                  [depositFeeByChain$(chain, type)]
                : // for sym deposits, two txs at thorchain an asset chain needed == 2 fees,
                  [depositFeeByChain$(chain, type), depositFeeByChain$('THOR', type)]
            ),
            RxOp.map(sequenceTRDFromArray),
            liveData.map(([asset, thor]) => ({
              asset,
              thor: O.fromNullable(thor)
            }))
          )
        ),
        O.getOrElse((): DepositFeesLD => Rx.of(RD.initial))
      )
    )
  )

export { depositFees$, reloadDepositFees, depositFeeByChain$ }
