import { Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import * as BNB from '../binance/service'
import * as BTC from '../bitcoin/context'
import { selectedPoolChain$ } from '../midgard/common'
import { LoadFeesHandler } from './types'

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
