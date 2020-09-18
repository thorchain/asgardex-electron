import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient, Network as BitcoinNetwork } from '@thorchain/asgardex-bitcoin'
import { baseAmount } from '@thorchain/asgardex-util'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, catchError, shareReplay, startWith, distinctUntilChanged, debounceTime } from 'rxjs/operators'

import { AssetBTC } from '../../const'
import { BTC_DECIMAL } from '../../helpers/assetHelper'
import { envOrDefault } from '../../helpers/envHelper'
import { eqOString } from '../../helpers/fp/eq'
import { triggerStream } from '../../helpers/stateHelper'
import { network$ } from '../app/service'
import { ClientStateForViews } from '../types'
import { getClientStateForViews, getClient } from '../utils'
import { keystoreService } from '../wallet/service'
import { AssetWithBalanceRD, AssetWithBalance, ApiError, ErrorId } from '../wallet/types'
import { getPhrase } from '../wallet/util'
import { BitcoinClientState } from './types'

/**
 * Binance network depending on selected `Network`
 */
const bitcoinNetwork$: Observable<BitcoinNetwork> = network$.pipe(
  map((network) => {
    if (network === 'testnet') return BitcoinNetwork.TEST
    // In case of 'chaosnet' + 'mainnet` we use `BitcoinNetwork.MAIN`
    return BitcoinNetwork.MAIN
  })
)

const ELECTRS_TESTNET = envOrDefault(process.env.REACT_APP_BITCOIN_ELECRTS_TESTNET_API, 'http://165.22.106.224')
const ELECTRS_MAINNET = envOrDefault(process.env.REACT_APP_BITCOIN_ELECRTS_MAINNET_API, 'http://188.166.254.248')

/**
 * Stream to create an observable BitcoinClient depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new BitcoinClient will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `none`
 * A BitcoinClient will never be created as long as no phrase is available
 */
const clientState$ = Rx.combineLatest([keystoreService.keystore$, bitcoinNetwork$]).pipe(
  mergeMap(
    ([keystore, bitcoinNetwork]) =>
      new Observable((observer: Observer<BitcoinClientState>) => {
        const client: BitcoinClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              // Url of electrs
              const electrsUrl = bitcoinNetwork === BitcoinNetwork.TEST ? ELECTRS_TESTNET : ELECTRS_MAINNET
              const client = new BitcoinClient(bitcoinNetwork, electrsUrl, phrase)
              return O.some(right(client)) as BitcoinClientState
            } catch (error) {
              return O.some(left(error))
            }
          })
        )
        observer.next(client)
      }) as Observable<BitcoinClientState>
  )
)

export type ClientState = typeof clientState$

const client$: Observable<O.Option<BitcoinClient>> = clientState$.pipe(map(getClient), shareReplay(1))

/**
 * Helper stream to provide "ready-to-go" state of latest `BitcoinClient`, but w/o exposing the client
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
const address$: Observable<O.Option<string>> = client$.pipe(
  map(FP.pipe(O.chain((client) => O.some(client.getAddress())))),
  distinctUntilChanged(eqOString.equals),
  shareReplay(1)
)

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
      Rx.of(RD.failure({ apiId: 'BTC', errorId: ErrorId.GET_BALANCES, msg: error?.message ?? '' } as ApiError))
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

/**
 * Object with all "public" functions and observables
 */
export { client$, clientViewState$, address$, reloadBalances, assetWB$ }
