import * as RD from '@devexperts/remote-data-ts'
import { Client } from '@xchainjs/xchain-binance'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import { map, mergeMap, catchError, shareReplay, startWith, debounceTime } from 'rxjs/operators'

import { BalancesRD, ApiError, ErrorId, BalancesLD } from '../wallet/types'
import { client$, reloadBalances$ } from './common'

/**
 * Observable to load balances from Binance API endpoint
 */
const loadBalances$ = (client: Client): BalancesLD =>
  Rx.from(client.getBalance()).pipe(
    map(RD.success),
    catchError((error: Error) =>
      Rx.of(RD.failure({ errorId: ErrorId.GET_BALANCES, msg: error?.message ?? '' } as ApiError))
    ),
    startWith(RD.pending)
  )

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
        loadBalances$
      )
    )
  }),
  // cache it to avoid reloading data by every subscription
  shareReplay(1)
)

export { loadBalances$, balances$ }
