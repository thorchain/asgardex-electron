import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import { mergeMap, shareReplay, debounceTime } from 'rxjs/operators'

import * as C from '../clients'
import { BalancesRD } from '../wallet/types'
import { client$, reloadBalances$ } from './common'

/**
 * State of `Balances`
 *
 * Data will be loaded by first subscription only
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
const balances$: Observable<BalancesRD> = Rx.combineLatest([reloadBalances$.pipe(debounceTime(300)), client$]).pipe(
  mergeMap(([_, client]) => {
    return FP.pipe(
      client,
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

export { balances$ }
