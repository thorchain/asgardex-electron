import * as RD from '@devexperts/remote-data-ts'
import { XChainClient } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'
import { catchError, startWith, map, shareReplay, debounceTime } from 'rxjs/operators'

import { TriggerStream$ } from '../../helpers/stateHelper'
import { ApiError, ErrorId } from '../wallet/types'
import { BalancesLD, XChainClient$ } from './types'

/**
 * Observable to request balances based on given `XChainClient`
 */
const loadBalances$: (client: XChainClient) => BalancesLD = (client) =>
  Rx.from(client.getBalance()).pipe(
    map(RD.success),
    catchError((error: Error) =>
      Rx.of(RD.failure({ errorId: ErrorId.GET_BALANCES, msg: error?.message ?? '' } as ApiError))
    ),
    startWith(RD.pending)
  )

/**
 * State of `Balances` loaded by given `XChainClient`
 * It will be reloaded by a next value of given `TriggerStream$`
 *
 * `Balances` is loaded by first subscription only, all other subscriber will use same state.
 * To reload `Balances`, trigger a next value to `trigger$` stream
 *
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
export const balances$: (client$: XChainClient$, trigger$: TriggerStream$) => BalancesLD = (client$, trigger$) =>
  Rx.combineLatest([trigger$.pipe(debounceTime(300)), client$]).pipe(
    RxOp.mergeMap(([_, oClient]) => {
      return FP.pipe(
        oClient,
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
