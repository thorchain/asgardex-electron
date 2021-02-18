import { Client as BitcoinCashClient, ClientUrl } from '@xchainjs/xchain-bitcoincash'
import { Network as ClientNetwork } from '@xchainjs/xchain-client'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay } from 'rxjs/operators'

import { network$ } from '../app/service'
import * as C from '../clients'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { ClientState } from './types'

/**
 * Bitcoin Cash network depending on selected `Network`
 */
const bitcoinCashNetwork$: Observable<ClientNetwork> = network$.pipe(
  map((network) => {
    // In case of 'chaosnet' + 'mainnet` we stick on `mainnet`
    if (network === 'chaosnet') return 'mainnet'

    return network
  })
)

const HASKOIN_API_URL: ClientUrl = {
  testnet: 'https://api.haskoin.com/bchtest',
  mainnet: 'https://api.haskoin.com/bch'
}

/**
 * Stream to create an observable BitcoinCashClient depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new BitcoinCashClient will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `none`
 * A BitcoinCashClient will never be created as long as no phrase is available
 */
const clientState$ = Rx.combineLatest([keystoreService.keystore$, bitcoinCashNetwork$]).pipe(
  mergeMap(
    ([keystore, bitcoinCashNetwork]) =>
      new Observable((observer: Observer<ClientState>) => {
        const client: ClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const client = new BitcoinCashClient({
                network: bitcoinCashNetwork,
                clientUrl: HASKOIN_API_URL,
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

const client$: Observable<O.Option<BitcoinCashClient>> = clientState$.pipe(map(C.getClient), shareReplay(1))

/**
 * Helper stream to provide "ready-to-go" state of latest `BitcoinCashClient`, but w/o exposing the client
 * It's needed by views only.
 */
const clientViewState$: Observable<C.ClientStateForViews> = clientState$.pipe(map(C.getClientStateForViews))

/**
 * BCH `Address`
 */
const address$: C.Address$ = C.address$(client$)

export { address$, client$, clientViewState$ }
