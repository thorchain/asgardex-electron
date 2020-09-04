import { Client as BitcoinClient, Network as BitcoinNetwork } from '@thorchain/asgardex-bitcoin'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay, distinctUntilChanged } from 'rxjs/operators'

import { envOrDefault } from '../../helpers/envHelper'
import * as fpHelpers from '../../helpers/fpHelpers'
import { observableState } from '../../helpers/stateHelper'
import { Network } from '../app/types'
import { DEFAULT_NETWORK } from '../const'
import { ClientStateForViews } from '../types'
import { getClientStateForViews, getClient } from '../utils'
import { KeystoreState } from '../wallet/types'
import { getPhrase } from '../wallet/util'
import { BitcoinClientState } from './types'

const BITCOIN_ELECTRS_API = envOrDefault(process.env.BITCOIN_ELECRTS_TESTNET_API, 'http://165.22.106.224')

/**
 * Observable state of `Network`
 */
const { get$: getNetworkState$, set: setNetworkState } = observableState<Network>(DEFAULT_NETWORK)

/**
 * Binance network depending on `Network`
 */
const bitcoinNetwork$: Observable<BitcoinNetwork> = getNetworkState$.pipe(
  mergeMap((network) => {
    if (network === 'testnet') return Rx.of(BitcoinNetwork.TEST)
    // In case of 'chaosnet' + 'mainnet` use BitcoinNetwork.MAIN
    return Rx.of(BitcoinNetwork.MAIN)
  })
)

/**
 * Observable state of `KeystoreState`
 */
const { get$: getKeystoreState$, set: setKeystoreState } = observableState<KeystoreState>(O.none)

/**
 * Stream to create an observable BitcoinClient depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new BitcoinClient will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `None`
 * A BitcoinClient will never be created as long as no phrase is available
 */
const clientState$ = Rx.combineLatest(getKeystoreState$, bitcoinNetwork$).pipe(
  mergeMap(
    ([keystore, bitcoinNetwork]) =>
      Observable.create((observer: Observer<BitcoinClientState>) => {
        const client: BitcoinClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const client = new BitcoinClient(bitcoinNetwork, BITCOIN_ELECTRS_API, phrase)
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
  distinctUntilChanged(fpHelpers.eqOString.equals),
  shareReplay(1)
)

/**
 * Object with all "public" functions and observables
 */
export { setNetworkState, client$, setKeystoreState, clientViewState$, address$ }
