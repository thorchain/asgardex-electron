import * as RD from '@devexperts/remote-data-ts'
import { WS, Client, Network as BinanceNetwork, BinanceClient, Address, TxPage } from '@thorchain/asgardex-binance'
import { Asset } from '@thorchain/asgardex-util'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import { none, some } from 'fp-ts/lib/Option'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import {
  map,
  mergeMap,
  catchError,
  retry,
  shareReplay,
  startWith,
  switchMap,
  debounceTime,
  distinctUntilChanged
} from 'rxjs/operators'
import { webSocket } from 'rxjs/webSocket'

import { envOrDefault } from '../../helpers/envHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import * as fpHelpers from '../../helpers/fpHelpers'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { Network } from '../app/types'
import { KeystoreState } from '../wallet/types'
import { getPhrase } from '../wallet/util'
import { createFreezeService } from './freeze'
import { createTransactionService } from './transaction'
import { BalancesRD, BinanceClientStateForViews, BinanceClientState, TxsRD } from './types'
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
 * Binance network depending on `Network`
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
 *
 * Whenever a phrase has been added to keystore, a new BinanceClient will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `None`
 * A BinanceClient will never be created as long as no phrase is available
 */
const clientState$ = Rx.combineLatest(getKeystoreState$, binanceNetwork$).pipe(
  mergeMap(
    ([keystore, binanceNetwork]) =>
      Observable.create((observer: Observer<BinanceClientState>) => {
        const client = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const cleint = new Client(phrase, binanceNetwork)
              return some(right(cleint)) as BinanceClientState
            } catch (error) {
              return some(left(error))
            }
          })
        )
        observer.next(client)
      }) as Observable<BinanceClientState>
  )
)

export type ClientState = typeof clientState$

/**
 * Helper stream to provide "ready-to-go" state of latest `BinanceClient`, but w/o exposing the client
 * It's needed by views only.
 */
const clientViewState$: Observable<BinanceClientStateForViews> = clientState$.pipe(
  map((clientState) => getBinanceClientStateForViews(clientState))
)

/**
 * Current `Address` depending on selected network
 *
 * If a client is not available (e.g. by removing keystore), it returns `None`
 *
 */
const address$: Observable<O.Option<Address>> = clientState$.pipe(
  mergeMap((clientState) =>
    Rx.of(
      FP.pipe(
        getBinanceClient(clientState),
        O.chain((client) => some(client.getAddress()))
      )
    )
  ),
  distinctUntilChanged(fpHelpers.eqOString.equals),
  shareReplay()
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
const balancesState$: Observable<BalancesRD> = Rx.combineLatest(
  reloadBalances$.pipe(debounceTime(300)),
  clientState$
).pipe(
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

const { get$: selectedAsset$, set: setSelectedAsset } = observableState<O.Option<Asset>>(O.none)

/**
 * Observable to load txs from Binance API endpoint
 * If client is not available, it returns an `initial` state
 */
const loadTxsOfSelectedAsset$ = (client: BinanceClient, asset: O.Option<Asset>): Observable<TxsRD> => {
  const txAsset = FP.pipe(
    asset,
    O.fold(
      () => undefined,
      (asset) => asset.symbol
    )
  )

  const endTime = Date.now()
  // Offset is set to a 90 day window - similar to ASGARDEX wallet approach,
  // see https://gitlab.com/thorchain/asgard-wallet/-/blob/develop/imports/api/wallet.js#L39-48
  const offset = 90 * 24 * 60 * 60 * 1000
  const startTime = endTime - offset
  return Rx.from(client.getTransactions({ txAsset, endTime, startTime })).pipe(
    mergeMap(({ tx }: TxPage) => Rx.of(RD.success(tx))),
    catchError((error) => Rx.of(RD.failure(error))),
    startWith(RD.pending),
    retry(BINANCE_MAX_RETRY)
  )
}

// `TriggerStream` to reload `Txs`
const { stream$: reloadTxsSelectedAsset$, trigger: reloadTxssSelectedAsset } = triggerStream()

/**
 * State of `Txs`
 *
 * Data will be loaded by first subscription only
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
const txsSelectedAsset$: Observable<TxsRD> = Rx.combineLatest(
  clientState$,
  reloadTxsSelectedAsset$.pipe(debounceTime(300)),
  selectedAsset$
).pipe(
  mergeMap(([clientState, _, oAsset]) => {
    const client = getBinanceClient(clientState)
    return FP.pipe(
      // client and asset has to be available
      sequenceTOption(client, oAsset),
      O.fold(
        () => Rx.of(RD.initial as TxsRD),
        ([clientState, asset]) => loadTxsOfSelectedAsset$(clientState, O.some(asset))
      )
    )
  }),
  // cache it to avoid reloading data by every subscription
  shareReplay()
)

/**
 * Explorer url depending on selected network
 *
 * If a client is not available (e.g. by removing keystore), it returns `None`
 *
 */
const explorerUrl$: Observable<O.Option<string>> = clientState$.pipe(
  mergeMap((clientState) =>
    Rx.of(
      FP.pipe(
        getBinanceClient(clientState),
        O.chain((client) => some(client.getExplorerUrl()))
      )
    )
  ),
  shareReplay()
)

const transaction = createTransactionService(clientState$)

const freeze = createFreezeService(clientState$)

const client$: Observable<O.Option<BinanceClient>> = clientState$.pipe(
  mergeMap((clientState) => Rx.of(getBinanceClient(clientState))),
  shareReplay(1)
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
  setSelectedAsset,
  reloadBalances,
  txsSelectedAsset$,
  reloadTxssSelectedAsset,
  address$,
  selectedAsset$,
  explorerUrl$,
  transaction,
  freeze,
  client$
}
