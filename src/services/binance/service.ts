import * as RD from '@devexperts/remote-data-ts'
import { WS, Client, Network as BinanceNetwork, BinanceClient } from '@thorchain/asgardex-binance'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import { none, some } from 'fp-ts/lib/Option'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, catchError, retry, shareReplay, startWith, switchMap } from 'rxjs/operators'
import { webSocket } from 'rxjs/webSocket'

import { envOrDefault } from '../../helpers/envHelper'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { Network } from '../app/types'
import { KeystoreState } from '../wallet/types'
import { getPhrase } from '../wallet/util'
import { BalancesRD, BinanceClientStateForViews, BinanceClientState } from './types'
import { getBinanceClientStateForViews, getBinanceClient } from './utils'

const BINANCE_TESTNET_WS_URI = envOrDefault(
  process.env.REACT_APP_BINANCE_TESTNET_WS_URI,
  'wss://testnet-dex.binance.org/api/ws'
)

const BINANCE_MAINET_WS_URI = envOrDefault(process.env.REACT_APP_BINANCE_MAINNET_WS_URI, 'wss://dex.binance.org/api/ws')

/**
 * Observable state of `Network`
 */
const { get$: getNetworkState$, set: setNetworkState } = observableState<Network>(Network.TEST)

/**
 * Websocket endpoint depending on `Network`
 */
const wsEndpoint$ = getNetworkState$.pipe(
  mergeMap((network) => {
    if (network === Network.MAIN) return Rx.of(BINANCE_MAINET_WS_URI)
    // all other networks use testnet url for now
    return Rx.of(BINANCE_TESTNET_WS_URI)
  })
)

/**
 * All types of incoming messages, which can be different
 */
type WSInMsg = WS.TransferEvent | WS.MiniTickersEvent

const ws$ = wsEndpoint$.pipe(map((endpoint) => webSocket<WSInMsg>(endpoint)))

/**
 * Observable for subscribing / unsubscribing transfers by given address
 * https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 *
 * Note: No need to serialize / deserialize messages.
 * By default `WebSocketSubjectConfig` is going to apply `JSON.parse` to each message comming from the Server.
 * and applies `JSON.stringify` by default to messages sending to the server.
 * @see https://rxjs-dev.firebaseapp.com/api/webSocket/WebSocketSubjectConfig#properties
 *
 * @param address Address to listen for transfers
 */
const subscribeTransfers = (address: string) => {
  const msg = {
    topic: 'transfers',
    address
  }
  return ws$.pipe(
    switchMap((ws) =>
      ws
        .multiplex(
          () => ({
            method: 'subscribe',
            ...msg
          }),
          () => ({
            method: 'unsubscribe',
            ...msg
          }),
          // filter out messages if data is not available
          (e) => (e as WS.TransferEvent).data !== undefined
        )
        .pipe(
          // Since we filtered messages before,
          // we know that data is available here, but it needs to be typed again
          map((event: WS.TransferEvent) => event.data as WS.Transfer)
        )
    )
  )
}

/**
 * JUST for DEBUGGING - we don't need a subscription of 'allTickers'
 *
 * Observable for subscribing / unsubscribing all tickers
 *
 * 24hr Ticker statistics for a all symbols are pushed every second.
 * https://docs.binance.org/api-reference/dex-api/ws-streams.html#11-all-symbols-mini-ticker-streams
 */

const allMiniTickersMsg = {
  topic: 'allMiniTickers',
  symbols: ['$all']
}

const miniTickers$ = ws$.pipe(
  switchMap((ws) =>
    ws
      .multiplex(
        () => ({
          method: 'subscribe',
          ...allMiniTickersMsg
        }),
        () => ({
          method: 'unsubscribe',
          ...allMiniTickersMsg
        }),
        // filter out messages if data is not available
        (e) => (e as WS.MiniTickersEvent).data !== undefined
      )
      .pipe(
        // Since we have filtered messages out before,
        // we know that `data` is available here,
        // but we have to do a type cast again
        map((event: WS.MiniTickersEvent) => event?.data as WS.MiniTickers)
      )
  )
)

const BINANCE_MAX_RETRY = 3

/**
 * Binannce network depending on `Network`
 */
const binanceNetwork$: Observable<BinanceNetwork> = getNetworkState$.pipe(
  mergeMap((network) => {
    if (network === Network.MAIN) return Rx.of('mainnet' as BinanceNetwork)
    // all other networks use testnet url for now
    return Rx.of('testnet' as BinanceNetwork)
  })
)

/**
 * Observable state of `KeystoreState`
 */
const { get$: getKeystoreState$, set: setKeystoreState } = observableState<KeystoreState>(none)

/**
 * Stream to create an observable BinanceClient depending on existing phrase in keystore
 * Whenever a phrase has been added to keystore, a new BinanceClient will be created as well
 * By the other hand: Whenever a phrase has been removed, the client is set to `none`
 * A BinanceClient will never be created as long as no phrase is available
 */
const clientState$ = Rx.combineLatest(getKeystoreState$, binanceNetwork$).pipe(
  mergeMap(
    ([keystore, binanceNetwork]) =>
      Observable.create((observer: Observer<BinanceClientState>) => {
        const client = FP.pipe(
          getPhrase(keystore),
          O.fold(
            // Whenever a phrase has been removed, previous client will "be removed" by setting it to `none`
            () => none,
            // TODO (@Veado): `BinanceClient` will depend on network state in AppContext
            // For now we use testnet only ...
            // see https://github.com/thorchain/asgardex-electron/issues/209
            (phrase: string) => {
              try {
                const client = new Client(phrase, binanceNetwork)
                return some(right(client))
              } catch (error) {
                return some(left(error))
              }
            }
          )
        )
        observer.next(client)
      }) as Observable<BinanceClientState>
  )
)

/**
 * Helper stream to provide "ready-to-go" state of latest `BinanceClient`, but w/o exposing the client
 * It's needed by views only.
 */
const clientViewState$: Observable<BinanceClientStateForViews> = clientState$.pipe(
  map((clientState) => getBinanceClientStateForViews(clientState))
)

/**
 * Observable to load balances from Binance API endpoint
 * If client is not available, it returns an `initial` state
 */
const loadBalances$ = (client: BinanceClient): Observable<BalancesRD> =>
  Rx.from(client.getBalance()).pipe(
    mergeMap((balances) => Rx.of(RD.success(balances))),
    catchError((error) => Rx.of(RD.failure(error))),
    startWith(RD.pending),
    retry(BINANCE_MAX_RETRY)
  )

// `TriggerStream` to reload `Balances`
const { stream$: reloadBalances$, trigger: reloadBalances } = triggerStream()

/**
 * State of `Balances`
 *
 * Data will be loaded by first subscription only
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
const balancesState$: Observable<BalancesRD> = Rx.combineLatest(reloadBalances$, clientState$).pipe(
  mergeMap(([_, clientState]) => {
    const client = getBinanceClient(clientState)
    return FP.pipe(
      client,
      O.fold(
        // if a client is available, "reset" state to "initial"
        () => Rx.of(RD.initial),
        // or start request and return state
        loadBalances$
      )
    )
  }),
  // cache it to avoid reloading data by every subscription
  shareReplay()
)

/**
 * Object with all "public" functions and observables
 */
export {
  miniTickers$,
  subscribeTransfers,
  setNetworkState,
  setKeystoreState,
  clientViewState$,
  balancesState$,
  reloadBalances
}
