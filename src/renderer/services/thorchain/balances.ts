import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { mergeMap, shareReplay, debounceTime } from 'rxjs/operators'

import { triggerStream } from '../../helpers/stateHelper'
import * as C from '../clients'
import { BalancesLD } from '../wallet/types'
import { client$ } from './common'

// `TriggerStream` to reload `Balances`
const { stream$: reloadBalances$, trigger: reloadBalances } = triggerStream()

/**
 * State of `Balance`s provided as `BalancesLD`
 *
 * Data will be loaded by first subscription only
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
const balances$: BalancesLD = Rx.combineLatest([reloadBalances$.pipe(debounceTime(300)), client$]).pipe(
  mergeMap(([_, oClient]) => {
    return FP.pipe(
      oClient,
      O.fold(
        // if a client is not available, "reset" state to "initial"
        () => Rx.of(RD.initial),
        // or start request and return state
        C.loadBalances$
      )
    )
  }),
  // cache it to avoid reloading data by every subscription
  shareReplay(1)
)

export { balances$, reloadBalances }
