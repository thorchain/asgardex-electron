import * as RD from '@devexperts/remote-data-ts'
import { Client } from '@thorchain/asgardex-ethereum'
import { Balance } from '@xchainjs/xchain-client'
import { AssetETH, baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import { mergeMap, shareReplay, catchError, startWith, debounceTime } from 'rxjs/operators'

import { ETH_DECIMAL } from '../../helpers/assetHelper'
import { triggerStream } from '../../helpers/stateHelper'
import { ApiError, BalanceRD, ErrorId } from '../wallet/types'
import { client$ } from './common'

/**
 * Observable to load balances
 * If client is not available, it returns an `initial` state
 */
const loadBalances$ = (client: Client): Observable<BalanceRD> =>
  Rx.from(client.getBalance()).pipe(
    mergeMap((balance) =>
      Rx.of(
        RD.success({
          asset: AssetETH,
          amount: baseAmount(balance.toString(), ETH_DECIMAL)
        } as Balance)
      )
    ),
    catchError((error: Error) =>
      Rx.of(RD.failure({ errorId: ErrorId.GET_BALANCES, msg: error?.message ?? '' } as ApiError))
    ),
    startWith(RD.pending)
  )

// `TriggerStream` to reload `Balances`
const { stream$: reloadBalances$, trigger: reloadBalances } = triggerStream()

/**
 * State of `Balance`s provided as `BalanceRD`
 *
 * Data will be loaded by first subscription only
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
const balances$: Observable<BalanceRD> = Rx.combineLatest([reloadBalances$.pipe(debounceTime(300)), client$]).pipe(
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

export { loadBalances$, reloadBalances, balances$ }
