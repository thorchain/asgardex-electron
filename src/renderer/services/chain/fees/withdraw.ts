import * as RD from '@devexperts/remote-data-ts'
import {
  Asset,
  BCHChain,
  BNBChain,
  BTCChain,
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

import { ZERO_BASE_AMOUNT } from '../../../const'
import { getChainAsset } from '../../../helpers/chainHelper'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as BCH from '../../bitcoincash'
import * as ETH from '../../ethereum'
import * as LTC from '../../litecoin'
import * as THOR from '../../thorchain'
import { FeeOptionKeys } from '../const'
import { FeeLD, WithdrawFeesHandler, WithdrawFeesParams } from '../types'

const withdrawFeeByChain$ = (asset: Asset, memo: string): FeeLD => {
  const chainAsset = getChainAsset(asset.chain)

  switch (chainAsset.chain) {
    case BNBChain:
      return FP.pipe(
        BNB.fees$(),
        liveData.map((fees) => fees[FeeOptionKeys.WITHDRAW])
      )
    case BTCChain:
      // withdraw fee for BTC txs based on withdraw memo
      return FP.pipe(
        BTC.feesWithRates$(memo),
        liveData.map(({ fees }) => fees[FeeOptionKeys.WITHDRAW])
      )
    case THORChain:
      return FP.pipe(
        THOR.fees$(),
        liveData.map((fees) => fees[FeeOptionKeys.WITHDRAW])
      )
    case ETHChain:
      return FP.pipe(
        ETH.poolOutTxFee$(asset),
        liveData.map((fees) => fees[FeeOptionKeys.WITHDRAW])
      )
    case CosmosChain:
      return Rx.of(RD.failure(Error(`Withdraw fee for Cosmos has not been implemented`)))
    case PolkadotChain:
      return Rx.of(RD.failure(Error(`Withdraw fee for Polkadot has not been implemented`)))
    case BCHChain:
      return FP.pipe(
        BCH.feesWithRates$(memo),
        liveData.map(({ fees }) => fees[FeeOptionKeys.WITHDRAW])
      )
    case LTCChain:
      return FP.pipe(
        LTC.feesWithRates$(memo),
        liveData.map(({ fees }) => fees[FeeOptionKeys.WITHDRAW])
      )
  }
}

// state for reloading swap fees
const { get$: reloadWithdrawFee$, set: reloadWithdrawFees } = observableState<O.Option<WithdrawFeesParams>>(O.none)

const withdrawFees$: WithdrawFeesHandler = (oInitialParams) => {
  return FP.pipe(
    reloadWithdrawFee$,
    RxOp.switchMap((oReloadParams) => {
      return FP.pipe(
        // (1) Always check reload params first
        oReloadParams,
        // (2) If reload params not set (which is by default), use initial params
        O.alt(() => oInitialParams),
        O.fold(
          // If both (initial + reload params) are not set, return zero fees
          () => Rx.of(RD.success(ZERO_BASE_AMOUNT)),
          ({ asset, memo }) => {
            return FP.pipe(
              withdrawFeeByChain$(asset, memo),
              // Result needs to be 3 times as "normal" fee
              liveData.map((fee) => fee.times(3))
            )
          }
        )
      )
    })
  )
}

export { reloadWithdrawFees, withdrawFees$ }
