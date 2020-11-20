import { XChainClient } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import { Observable } from 'rxjs'
import * as Rx from 'rxjs'

import * as BTC from '../bitcoin'

export const clientByChain$ = (chain: Chain): Observable<O.Option<XChainClient>> => {
  switch (chain) {
    case 'BNB':
      // TODO (@Veado / @ThatStrangeGuy) Add BNB after https://github.com/thorchain/asgardex-electron/pull/583 has been merged
      return Rx.of(O.none)
    case 'BTC':
      return BTC.client$
    case 'ETH':
      return Rx.of(O.none)
    case 'THOR':
      return Rx.of(O.none)
    default:
      return Rx.of(O.none)
  }
}
