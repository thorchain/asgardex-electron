import { Client as BitcoinClient, Network as BitcoinNetwork } from '@thorchain/asgardex-bitcoin'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay, distinctUntilChanged } from 'rxjs/operators'

import { envOrDefault } from '../../helpers/envHelper'
import { eqOString } from '../../helpers/fp/eq'
import { network$ } from '../app/service'
import { ClientStateForViews } from '../types'
import { getClientStateForViews, getClient } from '../utils'
import { keystoreService } from '../wallet/common'
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

export type ClientState$ = typeof clientState$

const client$: Observable<O.Option<BitcoinClient>> = clientState$.pipe(map(getClient), shareReplay(1))

export type Client$ = typeof client$

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
 * Explorer url depending on selected network
 *
 * If a client is not available (e.g. by removing keystore), it returns `None`
 *
 */
const explorerUrl$: Observable<O.Option<string>> = client$.pipe(
  map(FP.pipe(O.map((client) => client.getExplorerUrl()))),
  distinctUntilChanged(eqOString.equals),
  shareReplay(1)
)

export { client$, clientViewState$, address$, explorerUrl$ }
