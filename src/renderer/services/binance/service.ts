import * as RD from '@devexperts/remote-data-ts'
import { WS, Client, Network as BinanceNetwork, Address } from '@xchainjs/xchain-binance'
import { Asset, assetToBase, baseToAsset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
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
import * as RxOperators from 'rxjs/operators'
import { webSocket } from 'rxjs/webSocket'

import { envOrDefault } from '../../helpers/envHelper'
import { eqOString } from '../../helpers/fp/eq'
import { liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import { network$ } from '../app/service'
import { FeeLD } from '../chain/types'
import { GetExplorerTxUrl } from '../clients/types'
import { ClientStateForViews } from '../types'
import { getClient, getClientStateForViews } from '../utils'
import { keystoreService } from '../wallet/common'
import { BalancesRD, ApiError, ErrorId, BalancesLD, TxsPageLD, LoadTxsProps } from '../wallet/types'
import { getPhrase } from '../wallet/util'
import { createTransactionService } from './transaction'
import { BinanceClientState, TransferFeesRD, BinanceClientState$ } from './types'

const BINANCE_TESTNET_WS_URI = envOrDefault(
  process.env.REACT_APP_BINANCE_TESTNET_WS_URI,
  'wss://testnet-dex.binance.org/api/ws'
)

const BINANCE_MAINET_WS_URI = envOrDefault(process.env.REACT_APP_BINANCE_MAINNET_WS_URI, 'wss://dex.binance.org/api/ws')

/**
 * Websocket endpoint depending on `Network`
 */
const wsEndpoint$ = network$.pipe(
  mergeMap((network) => {
    if (network === 'testnet') return Rx.of(BINANCE_TESTNET_WS_URI)
    // chaosnet + mainnet will use Binance mainet url
    return Rx.of(BINANCE_MAINET_WS_URI)
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
const binanceNetwork$: Observable<BinanceNetwork> = network$.pipe(
  mergeMap((network) => {
    if (network === 'testnet') return Rx.of('testnet' as BinanceNetwork)
    // chaosnet + mainnet are using Binance mainnet url
    return Rx.of('mainnet' as BinanceNetwork)
  })
)

/**
 * Stream to create an observable BinanceClient depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new BinanceClient will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `none`
 * A BinanceClient will never be created as long as no phrase is available
 */
const clientState$: BinanceClientState$ = Rx.combineLatest([keystoreService.keystore$, binanceNetwork$]).pipe(
  mergeMap(
    ([keystore, binanceNetwork]) =>
      Observable.create((observer: Observer<BinanceClientState>) => {
        const client: BinanceClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const client = new Client({ phrase, network: binanceNetwork })
              return O.some(right(client)) as BinanceClientState
            } catch (error) {
              return O.some(left(error))
            }
          })
        )
        observer.next(client)
      }) as Observable<BinanceClientState>
  )
)

const client$: Observable<O.Option<Client>> = clientState$.pipe(map(getClient), shareReplay(1))

export type Client$ = typeof client$

/**
 * Helper stream to provide "ready-to-go" state of latest `BinanceClient`, but w/o exposing the client
 * It's needed by views only.
 */
const clientViewState$: Observable<ClientStateForViews> = clientState$.pipe(
  map((clientState) => getClientStateForViews(clientState))
)

/**
 * Current `Address` depending on selected network
 *
 * If a client is not available (e.g. by removing keystore), it returns `None`
 *
 */
const address$: Observable<O.Option<Address>> = client$.pipe(
  map(FP.pipe(O.chain((client) => FP.pipe(client.getAddress(), O.fromNullable)))),
  distinctUntilChanged(eqOString.equals),
  shareReplay(1)
)

/**
 * Observable to load balances from Binance API endpoint
 */
const loadBalances$ = (client: Client): BalancesLD =>
  Rx.from(client.getBalance()).pipe(
    map(
      A.map((balance) => ({
        asset: balance.asset,
        amount: balance.amount
      }))
    ),
    map(RD.success),
    catchError((error: Error) =>
      Rx.of(RD.failure({ errorId: ErrorId.GET_BALANCES, msg: error?.message ?? '' } as ApiError))
    ),
    startWith(RD.pending),
    retry(BINANCE_MAX_RETRY)
  )

// `TriggerStream` to reload `Balances`
const { stream$: reloadBalances$, trigger: reloadBalances } = triggerStream()

/**
 * State of `Balance`s provided as `AssetsWithBalanceRD`
 *
 * Data will be loaded by first subscription only
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
const assetsWB$: Observable<BalancesRD> = Rx.combineLatest([reloadBalances$.pipe(debounceTime(300)), client$]).pipe(
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

/**
 * Observable to load txs from Binance API endpoint
 * If client is not available, it returns an `initial` state
 */
const loadTxs$ = ({
  client,
  oAsset,
  limit,
  offset
}: {
  client: Client
  oAsset: O.Option<Asset>
  limit: number
  offset: number
}): TxsPageLD => {
  const txAsset = FP.pipe(
    oAsset,
    O.fold(
      () => undefined,
      (asset) => asset.symbol
    )
  )

  return Rx.from(
    client.getTransactions({
      asset: txAsset,
      address: client.getAddress(),
      limit,
      offset
    })
  ).pipe(
    map(RD.success),
    catchError((error) =>
      Rx.of(RD.failure({ errorId: ErrorId.GET_ASSET_TXS, msg: error?.message ?? error.toString() } as ApiError))
    ),
    startWith(RD.pending)
  )
}

/**
 * `Txs` of selected asset
 *
 * Data will be loaded by first subscription only
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
const txs$ = (asset: Asset, { limit, offset }: LoadTxsProps): TxsPageLD =>
  client$.pipe(
    switchMap((client) =>
      FP.pipe(
        client,
        O.fold(
          () => Rx.of(RD.initial),
          (clientState) =>
            loadTxs$({
              client: clientState,
              oAsset: O.some(asset),
              limit,
              offset
            })
        )
      )
    )
  )

/**
 * Explorer url depending on selected network
 *
 * If a client is not available (e.g. by removing keystore), it returns `None`
 *
 */
export const explorerUrl$: Observable<O.Option<string>> = client$.pipe(
  map(FP.pipe(O.map((client) => client.getExplorerUrl()))),
  shareReplay(1)
)

const getExplorerTxUrl$: Observable<O.Option<GetExplorerTxUrl>> = client$.pipe(
  map(FP.pipe(O.map((client) => client.getExplorerTxUrl))),
  shareReplay(1)
)

// `TriggerStream` to reload `Fees`
const { stream$: reloadFees$, trigger: reloadFees } = triggerStream()

/**
 * Transaction fees
 * If a client is not available, it returns `None`
 */
const transferFees$: Observable<TransferFeesRD> = Rx.combineLatest([reloadFees$, client$]).pipe(
  switchMap(([_, oClient]) =>
    FP.pipe(
      // client and asset has to be available
      oClient,
      // ignore all assets from other chains than BNB
      O.fold(
        () => Rx.EMPTY,
        (client) => Rx.from(Promise.all([client.getFees(), client.getMultiSendFees()]))
      )
    )
  ),
  map(RD.success),
  liveData.map(([singleFee, multiFees]) => ({
    single: baseToAsset(singleFee.average),
    multi: baseToAsset(multiFees.average)
  })),
  startWith(RD.initial),
  shareReplay(1)
)

/**
 * Amount of stake `Fee`
 */
export const stakeFee$: FeeLD = FP.pipe(
  transferFees$,
  liveData.map((fees) => fees.single),
  liveData.map(assetToBase)
)

const wsTransfer$ = FP.pipe(
  address$,
  switchMap(O.fold(() => Rx.EMPTY, subscribeTransfers)),
  RxOperators.map(O.some),
  RxOperators.tap(O.map(reloadBalances)),
  RxOperators.startWith(O.none)
)

const transaction = createTransactionService(clientState$, wsTransfer$)

/**
 * Object with all "public" functions and observables
 */
export {
  miniTickers$,
  subscribeTransfers,
  client$,
  clientViewState$,
  assetsWB$,
  reloadBalances,
  txs$,
  address$,
  getExplorerTxUrl$,
  transaction,
  transferFees$,
  reloadFees
}
