import { Client as BitcoinClient } from '@xchainjs/xchain-bitcoin'
import { Network as ClientNetwork } from '@xchainjs/xchain-client'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay } from 'rxjs/operators'

import { envOrDefault } from '../../helpers/envHelper'
import { network$ } from '../app/service'
import * as C from '../clients'
import { GetExplorerAddressUrl$ } from '../clients'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { ClientState } from './types'

/**
 * Bitcoin network depending on selected `Network`
 */
const bitcoinNetwork$: Observable<ClientNetwork> = network$.pipe(
  map((network) => {
    // In case of 'chaosnet' + 'mainnet` we stick on `mainnet`
    if (network === 'chaosnet') return 'mainnet'

    return network
  })
)

const SOCHAIN_URL = envOrDefault(process.env.REACT_APP_SOCHAIN_URL, 'https://sochain.com/api/v2')

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
      new Observable((observer: Observer<ClientState>) => {
        const client: ClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const client = new BitcoinClient({
                network: bitcoinNetwork,
                nodeUrl: SOCHAIN_URL,
                phrase
              })
              return O.some(right(client))
            } catch (error) {
              return O.some(left(error))
            }
          })
        )
        observer.next(client)
      })
  )
)

const client$: Observable<O.Option<BitcoinClient>> = clientState$.pipe(map(C.getClient), shareReplay(1))

/**
 * Helper stream to provide "ready-to-go" state of latest `BitcoinClient`, but w/o exposing the client
 * It's needed by views only.
 */
const clientViewState$: Observable<C.ClientStateForViews> = clientState$.pipe(map(C.getClientStateForViews))

/**
 * BTC `Address`
 */
const address$: C.Address$ = C.address$(client$)

/**
 * Explorer url depending on selected network
 */
const explorerUrl$: C.ExplorerUrl$ = C.explorerUrl$(client$)
/**
 * Explorer url depending on selected network
 */
const getExplorerTxUrl$: C.GetExplorerTxUrl$ = C.getExplorerTxUrl$(client$)

/**
 * Explorer url depending on selected network
 */
const getExplorerAddressUrl$: GetExplorerAddressUrl$ = C.getExplorerAddressUrl$(client$)

export { client$, clientViewState$, address$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ }
