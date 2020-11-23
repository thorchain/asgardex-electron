import { Client as EthereumClient, Network as EthereumNetwork } from '@thorchain/asgardex-ethereum'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay } from 'rxjs/operators'

import { network$ } from '../app/service'
import { Address$ } from '../clients'
import { getClient } from '../clients/utils'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { Client$, ClientState } from './types'

/**
 * Binance network depending on `Network`
 */
const ethereumNetwork$: Observable<EthereumNetwork> = network$.pipe(
  map((network) => {
    if (network === 'testnet') return EthereumNetwork.TEST
    // In case of 'chaosnet' + 'mainnet` use EthereumNetwork.MAIN
    return EthereumNetwork.MAIN
  })
)

/**
 * Stream to create an observable EthereumClient depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new EthereumClient will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `none`
 * A EthereumClient will never be created as long as no phrase is available
 */
const clientState$ = Rx.combineLatest([keystoreService.keystore$, ethereumNetwork$]).pipe(
  mergeMap(
    ([keystore, network]) =>
      new Observable((observer: Observer<ClientState>) => {
        const client: ClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const client = new EthereumClient(network, phrase)
              return O.some(right(client)) as ClientState
            } catch (error) {
              return O.some(left(error))
            }
          })
        )
        observer.next(client)
      }) as Observable<ClientState>
  )
)

const client$: Client$ = clientState$.pipe(map(getClient), shareReplay(1))

/**
 * Current `Address` depending on selected network
 */
// TODO (@veado) Update if xchain-ethereum has been updated
// https://github.com/xchainjs/xchainjs-lib/issues/105
// const address$: Address$ = C.address$(client$)
const address$: Address$ = Rx.of(O.none)

export { client$, address$ }
