import { XChainClient } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import { Observable } from 'rxjs'
import * as Rx from 'rxjs'

import * as BNB from '../binance/service'
import * as BTC from '../bitcoin/context'

export const getClientByChain$ = (chain: Chain): Observable<O.Option<XChainClient>> => {
  switch (chain) {
    case 'BNB':
      return BNB.client$
    case 'BTC':
      return BTC.client$
    case 'ETH':
      // not ready yet
      return Rx.of(O.none)
    case 'THOR':
      // not implemented yet
      return Rx.of(O.none)
    default:
      return Rx.of(O.none)
  }
}
