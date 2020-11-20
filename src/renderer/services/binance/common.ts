import { Client, Network as BinanceNetwork, Address } from '@xchainjs/xchain-binance'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay, distinctUntilChanged } from 'rxjs/operators'

import { eqOString } from '../../helpers/fp/eq'
import { triggerStream } from '../../helpers/stateHelper'
import { network$ } from '../app/service'
import { GetExplorerTxUrl } from '../clients/types'
import { ClientStateForViews } from '../types'
import { getClient, getClientStateForViews } from '../utils'
import { keystoreService } from '../wallet/common'
import { getPhrase } from '../wallet/util'
import { BinanceClientState, BinanceClientState$, Client$ } from './types'

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
      new Observable((observer: Observer<BinanceClientState>) => {
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

const client$: Client$ = clientState$.pipe(map(getClient), shareReplay(1))

/**
 * Helper stream to provide "ready-to-go" state of latest `BinanceClient`, but w/o exposing the client
 * It's needed by views only.
 */
const clientViewState$: Observable<ClientStateForViews> = clientState$.pipe(map(getClientStateForViews))

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

const getExplorerTxUrl$: Observable<O.Option<GetExplorerTxUrl>> = client$.pipe(
  map(FP.pipe(O.map((client) => client.getExplorerTxUrl))),
  shareReplay(1)
)

// `TriggerStream` to reload `Balances`
const { stream$: reloadBalances$, trigger: reloadBalances } = triggerStream()

export {
  client$,
  clientState$,
  clientViewState$,
  address$,
  explorerUrl$,
  getExplorerTxUrl$,
  reloadBalances$,
  reloadBalances
}
