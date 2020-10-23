import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { triggerStream } from '../../helpers/stateHelper'
import * as BNB from '../binance/service'
import * as BTC from '../bitcoin/context'
import { selectedPoolChain$ } from '../midgard/common'
import { FeeLD } from './types'

const reloadFeesByChain = (chain: Chain) => {
  switch (chain) {
    case 'BNB':
      BNB.reloadFees()
      break
    case 'BTC':
      BTC.reloadFees()
      break
    case 'ETH':
      // not available yet
      break
    case 'THOR':
      // not available yet
      break
    default:
  }
}

// `TriggerStream` to reload fees
const { stream$: reloadFees$, trigger: reloadFees } = triggerStream()

// reload fees
Rx.combineLatest([selectedPoolChain$, reloadFees$])
  .pipe(RxOp.switchMap(([oChain]) => Rx.of(FP.pipe(oChain, O.map(reloadFeesByChain)))))
  .subscribe()

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

const stakeFee$: FeeLD = selectedPoolChain$.pipe(
  RxOp.switchMap((oChain) =>
    FP.pipe(
      oChain,
      O.fold(() => Rx.of(RD.initial), stakeFeeByChain$)
    )
  )
)

export { stakeFee$, reloadFees }
