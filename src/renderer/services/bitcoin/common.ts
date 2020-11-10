import { Client as BitcoinClient } from '@xchainjs/xchain-bitcoin'
import { Network as ClientNetwork } from '@xchainjs/xchain-client'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay, distinctUntilChanged } from 'rxjs/operators'

import { envOrDefault } from '../../helpers/envHelper'
import { eqOString } from '../../helpers/fp/eq'
import { network$ } from '../app/service'
import { GetExplorerTxUrl } from '../clients/types'
import { ClientStateForViews } from '../types'
import { getClientStateForViews, getClient } from '../utils'
import { keystoreService } from '../wallet/common'
import { getPhrase } from '../wallet/util'
import { BitcoinClientState } from './types'

/**
 * Binance network depending on selected `Network`
 */
const bitcoinNetwork$: Observable<ClientNetwork> = network$.pipe(
  map((network) => {
    // In case of 'chaosnet' + 'mainnet` we stick on `mainnet`
    if (network === 'chaosnet') return 'mainnet'

    return network
  })
)

const BLOCKCHAIR_API_KEY = envOrDefault(process.env.REACT_APP_BLOCKCHAIR_API_KEY, 'undefined blockchair api key')
const BLOCKCHAIR_TESTNET = 'https://api.blockchair.com/bitcoin/testnet'
const BLOCKCHAIR_MAINNET = 'https://api.blockchair.com/bitcoin'

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
              const blockchairUrl = bitcoinNetwork === 'testnet' ? BLOCKCHAIR_TESTNET : BLOCKCHAIR_MAINNET
              const client = new BitcoinClient({
                network: bitcoinNetwork,
                nodeUrl: blockchairUrl,
                nodeApiKey: BLOCKCHAIR_API_KEY,
                phrase
              })
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
 */
const explorerUrl$: Observable<O.Option<string>> = client$.pipe(
  map(FP.pipe(O.map((client) => client.getExplorerUrl()))),
  shareReplay(1)
)

/**
 * Explorer url depending on selected network
 *
 */
const getExplorerTxUrl$: Observable<O.Option<GetExplorerTxUrl>> = client$.pipe(
  map(FP.pipe(O.map((client) => client.getExplorerTxUrl))),
  shareReplay(1)
)

export { client$, clientViewState$, address$, explorerUrl$, getExplorerTxUrl$ }
