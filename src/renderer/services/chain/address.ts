import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { BASE_CHAIN } from '../../const'
import { isBaseChain } from '../../helpers/chainHelper'
import { eqOString } from '../../helpers/fp/eq'
import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import { selectedPoolChain$ } from '../midgard/common'
import { AddressRx } from './types'

const addressByChain$ = (chain: Chain): AddressRx => {
  switch (chain) {
    case 'BNB':
      return BNB.address$
    case 'BTC':
      return BTC.address$
    case 'ETH':
      return Rx.of(O.none)
    case 'THOR':
      return Rx.of(O.none)
  }
}

/**
 * Users wallet address for selected pool asset
 */
const assetAddress$: AddressRx = selectedPoolChain$.pipe(
  RxOp.switchMap((oChain) =>
    FP.pipe(
      oChain,
      // x-chain only
      O.filter((chain) => !isBaseChain(chain)),
      O.fold(() => Rx.of(O.none), addressByChain$)
    )
  ),
  RxOp.distinctUntilChanged(eqOString.equals)
)

/**
 * Users wallet address for RUNE
 */
const runeAddress$: AddressRx = addressByChain$(BASE_CHAIN).pipe(RxOp.distinctUntilChanged(eqOString.equals))

export { addressByChain$, assetAddress$, runeAddress$ }
