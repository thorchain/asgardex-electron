import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@thorchain/asgardex-bitcoin'
import { AssetBTC, baseAmount } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import { mergeMap, catchError, shareReplay, startWith, debounceTime } from 'rxjs/operators'

import { BTC_DECIMAL } from '../../helpers/assetHelper'
import { triggerStream } from '../../helpers/stateHelper'
import { AssetWithBalanceRD, AssetWithBalance, ApiError, ErrorId } from '../wallet/types'
import { client$ } from './common'

/**
 * Observable to load balances from Binance API endpoint
 * If client is not available, it returns an `initial` state
 */
const loadBalances$ = (client: BitcoinClient): Observable<AssetWithBalanceRD> =>
  Rx.from(client.getBalance()).pipe(
    mergeMap((balance) =>
      Rx.of(
        RD.success({
          asset: AssetBTC,
          amount: baseAmount(balance, BTC_DECIMAL),
          frozenAmount: O.none
        } as AssetWithBalance)
      )
    ),
    catchError((error: Error) =>
      Rx.of(RD.failure({ chainId: 'BTC', errorId: ErrorId.GET_BALANCES, msg: error?.message ?? '' } as ApiError))
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
const assetWB$: Observable<AssetWithBalanceRD> = Rx.combineLatest([
  reloadBalances$.pipe(debounceTime(300)),
  client$
]).pipe(
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

export { loadBalances$, assetWB$, reloadBalances }
