import { Network as ClientNetwork } from '@xchainjs/xchain-client'
import { Client } from '@xchainjs/xchain-thorchain'
import { right, left } from 'fp-ts/lib/Either'
// import { left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay } from 'rxjs/operators'

import { network$ } from '../app/service'
import { getClient } from '../clients/utils'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { Client$, ThorchainClientState } from './types'

/**
 * Thorchain network depending on selected `Network`
 */
const thorchainNetwork$: Observable<ClientNetwork> = network$.pipe(
  map((network) => {
    // In case of 'chaosnet' + 'mainnet` we stick on `mainnet`
    if (network === 'chaosnet') return 'mainnet'

    return network
  })
)

/**
 * Stream to create an observable ThorchainClient depending on existing phrase in keystore
 *
 * Whenever a phrase is added to keystore, a new ThorchainClient will be created.
 * By the other hand: Whenever a phrase is removed, the client will be set to `none`
 * A ThorchainClient will never be created if a phrase is not available
 */
const clientState$ = Rx.combineLatest([keystoreService.keystore$, thorchainNetwork$]).pipe(
  mergeMap(
    ([keystore, network]) =>
      new Observable((observer: Observer<ThorchainClientState>) => {
        const client: ThorchainClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const client = new Client({
                network: network,
                phrase
              })
              return O.some(right(client)) as ThorchainClientState
            } catch (error) {
              return O.some(left(error)) as ThorchainClientState
            }
          })
        )
        observer.next(client)
      })
  )
)

const client$: Client$ = clientState$.pipe(map(getClient), shareReplay(1))

export { client$, clientState$ }
