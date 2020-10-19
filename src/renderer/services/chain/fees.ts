import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import * as BNB from '../binance/service'
import * as BTC from '../bitcoin/context'
import { selectedPoolChain$ } from '../midgard/common'
import { LoadFeesHandler, FeeLD } from './types'

export const reloadFees = () => {
  BNB.reloadFees()
  BTC.reloadFees()
}

const reloadFeesByChain = (chain: Chain) => {
  switch (chain) {
    case 'BNB':
      return BNB.reloadFees
    case 'BTC':
      return BTC.reloadFees
    case 'ETH':
      // reload ETH balances - not available yet
      return () => {}
    case 'THOR':
      // reload THOR fees - not available yet
      return () => {}
    default:
      return () => {}
  }
}

export const reloadFees$: Rx.Observable<O.Option<LoadFeesHandler>> = selectedPoolChain$.pipe(
  RxOp.map(O.map(reloadFeesByChain))
)

const stakeFeeByChain$ = (chain: Chain): FeeLD => {
  switch (chain) {
    case 'BNB':
      return BNB.stakeFee$
    case 'BTC':
      return BTC.stakeFee$
    case 'ETH':
      return Rx.of(RD.failure(new Error('Stake fee for ETH has not been implemented')))
    case 'THOR':
      return Rx.of(RD.failure(new Error('Stake fee for THOR has not been implemented')))
    default:
      return Rx.of(RD.failure(new Error(`Getting stake fees for ${chain} is not supported`)))
  }
}

// export const stakeFee$: Rx.Observable<O.Option<AssetWithAmount>> = selectedChain$.pipe(
export const stakeFee$: FeeLD = selectedPoolChain$.pipe(
  RxOp.switchMap((oChain) =>
    FP.pipe(
      oChain,
      O.fold(() => Rx.of(RD.initial), stakeFeeByChain$)
    )
  )
)
