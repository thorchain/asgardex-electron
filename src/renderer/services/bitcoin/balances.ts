import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@xchainjs/xchain-bitcoin'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { mergeMap, catchError, shareReplay, startWith, debounceTime, map } from 'rxjs/operators'

import { triggerStream } from '../../helpers/stateHelper'
import { ApiError, AssetsWithBalanceLD, ErrorId } from '../wallet/types'
import { client$ } from './common'

/**
 * Observable to load balances from Binance API endpoint
 */
const loadBalances$ = (client: BitcoinClient): AssetsWithBalanceLD =>
  Rx.from(client.getBalance()).pipe(
    // Remove transformation `Balance` -> `AssetWithBalance` to use `Balance` only
    // https://github.com/thorchain/asgardex-electron/issues/584
    map(A.map((balance) => ({ ...balance, frozenAmount: O.fromNullable(balance.frozenAmount) }))),
    map(RD.success),
    catchError((error: Error) =>
      Rx.of(RD.failure({ errorId: ErrorId.GET_BALANCES, msg: error?.message ?? '' } as ApiError))
    ),
    startWith(RD.pending)
  )

// `TriggerStream` to reload `Balances`
const { stream$: reloadBalances$, trigger: reloadBalances } = triggerStream()

/**
 * State of `Balance`s provided as `AssetsWithBalanceRD`
 *
 * Data will be loaded by first subscription only
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
const assetsWB$: AssetsWithBalanceLD = Rx.combineLatest([reloadBalances$.pipe(debounceTime(300)), client$]).pipe(
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

export { loadBalances$, assetsWB$, reloadBalances }
