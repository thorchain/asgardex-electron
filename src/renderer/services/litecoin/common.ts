import { Network as ClientNetwork } from '@xchainjs/xchain-client'
import { Client } from '@xchainjs/xchain-litecoin'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay } from 'rxjs/operators'

import { envOrDefault } from '../../helpers/envHelper'
import { network$ } from '../app/service'
import * as C from '../clients'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { Client$, ClientState } from './types'

/**
 * Litecoin network depending on selected `Network`
 */
const litecoinNetwork$: Observable<ClientNetwork> = network$.pipe(
  map((network) => {
    // In case of 'chaosnet' + 'mainnet` we stick on `mainnet`
    if (network === 'chaosnet') return 'mainnet'

    return network
  })
)

const SOCHAIN_URL = envOrDefault(process.env.REACT_APP_SOCHAIN_URL, 'https://sochain.com/api/v2')

/**
 * Stream to create an observable LitecoinClient depending on existing phrase in keystore
 *
 * Whenever a phrase is added to keystore, a new LitecoinClient will be created.
 * By the other hand: Whenever a phrase is removed, the client will be set to `none`
 * A LitecoinClient will never be created if a phrase is not available
 */
const clientState$ = Rx.combineLatest([keystoreService.keystore$, litecoinNetwork$]).pipe(
  mergeMap(
    ([keystore, network]) =>
      new Observable((observer: Observer<ClientState>) => {
        const client: ClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const client = new Client({
                network: network,
                phrase,
                nodeUrl: SOCHAIN_URL
              })
              return O.some(right(client)) as ClientState
            } catch (error) {
              return O.some(left(error)) as ClientState
            }
          })
        )
        observer.next(client)
      })
  )
)

const client$: Client$ = clientState$.pipe(map(C.getClient), shareReplay(1))

/**
 * `Address`
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
const getExplorerAddressUrl$: C.GetExplorerAddressUrl$ = C.getExplorerAddressUrl$(client$)

export { client$, clientState$, address$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ }
