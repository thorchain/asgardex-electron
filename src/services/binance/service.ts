import * as RD from '@devexperts/remote-data-ts'
import { WS, BinanceClient, Client, Network } from '@thorchain/asgardex-binance'
import * as FP from 'fp-ts/lib/function'
import { Option, none } from 'fp-ts/lib/Option'
import * as O from 'fp-ts/lib/Option'
import { some } from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, tap, filter, catchError, retry, exhaustMap, shareReplay } from 'rxjs/operators'
import { webSocket } from 'rxjs/webSocket'

import { envOrDefault } from '../../helpers/envHelper'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { KeystoreState } from '../wallet/types'
import { getPhrase } from '../wallet/util'
import { BalancesRD } from './types'

const BINANCE_TESTNET_WS_URI = envOrDefault(
  process.env.REACT_APP_BINANCE_TESTNET_WS_URI,
  'wss://testnet-dex.binance.org/api/ws'
)

const BINANCE_MAINET_WS_URI = envOrDefault(process.env.REACT_APP_BINANCE_MAINNET_WS_URI, 'wss://dex.binance.org/api/ws')

// TODO (@Veado) Extract following stuff into `AppContext` or so...
enum Net {
  TEST = 'testent',
  MAIN = 'mainnet'
}

const currentNet = Net.TEST

// #END TODO

const getEndpoint = (net: Net) => {
  switch (net) {
    case Net.MAIN:
      return BINANCE_MAINET_WS_URI
    // all other networks use testnet url for now
    default:
      return BINANCE_TESTNET_WS_URI
  }
}

/**
 * All types of incoming messages, which can be different
 */
type WSInMsg = WS.TransferEvent | WS.MiniTickersEvent

const ws$ = webSocket<WSInMsg>(getEndpoint(currentNet))

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
  return ws$
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

const miniTickers$ = ws$
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

const BINANCE_MAX_RETRY = 3

/**
 * Observable state of `KeystoreState`
 */
const { get$: getKeystoreState$, set: setKeystoreState } = observableState<KeystoreState>(none)

/**
 * Stream to create an observable BinanceClient depending on existing phrase in keystore
 * A client won't be created as long as no phrase is available
 */
const client$ = getKeystoreState$.pipe(
  tap((keystore) => console.log('keystore changed ', keystore)),
  mergeMap(
    (keystore) =>
      Observable.create((observer: Observer<Option<BinanceClient>>) => {
        const client = FP.pipe(
          getPhrase(keystore),
          O.fold(
            () => none,
            // TODO (@Veado): Network will depend on network state in AppContext
            // For now we use testnet only ...
            // see https://github.com/thorchain/asgardex-electron/issues/209
            (phrase) => some(new Client(Network.TESTNET, phrase))
          )
        )
        observer.next(client)
      }) as Observable<Option<BinanceClient>>
  )
)

/**
 * Whenever a new BinanceClient has been created and it will be subscribed,
 * it's init() has to be called first (that's needed by design of `asgardex-binance` ...)
 */
const readyClient$ = client$.pipe(
  // check whether client has been created before
  filter(O.isSome),
  mergeMap((client) =>
    FP.pipe(
      client,
      O.fold(
        () => Rx.NEVER,
        (client) => Rx.from(client.init())
      )
    )
  )
)

/**
 * State of Balances
 */
const { get$: getBalanceState$, set: setBalanceState } = observableState<BalancesRD>(RD.initial)

/**
 * Observable to load balances from Binance API endpoint
 */
const getBalances$ = readyClient$.pipe(mergeMap((client) => Rx.from(client.getBalance())))

/**
 * Helper to load data of `Balances`
 */
const loadBalances$ = () => {
  // `pending` state
  setBalanceState(RD.pending)
  return getBalances$.pipe(
    // store result
    tap((balances) => setBalanceState(RD.success(balances))),
    // catch errors
    catchError((error: Error) => {
      // `error` state
      setBalanceState(RD.failure(error))
      return Rx.of('Error while fetching balances')
    }),
    retry(BINANCE_MAX_RETRY)
  )
}

// `TriggerStream` to reload `Balances`
const { stream$: reloadBalances$, trigger: reloadBalances } = triggerStream()

/**
 * State of `Balances`, it will be loaded data by first subscription only
 */
const balancesState$: Rx.Observable<BalancesRD> = reloadBalances$.pipe(
  // start request
  exhaustMap((_) => loadBalances$()),
  // return state
  mergeMap((_) => getBalanceState$),
  // cache it to avoid reloading data by every subscription
  shareReplay()
)

/**
 * Object with all "public" functions and observables
 */
export { miniTickers$, subscribeTransfers, setKeystoreState, balancesState$, reloadBalances }
