import { Client } from '@xchainjs/xchain-binance'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay } from 'rxjs/operators'

import { clientNetwork$ } from '../app/service'
import * as C from '../clients'
import { Address$, ExplorerUrl$, GetExplorerTxUrl$, GetExplorerAddressUrl$ } from '../clients/types'
import { ClientStateForViews } from '../clients/types'
import { getClient, getClientStateForViews } from '../clients/utils'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { ClientState, ClientState$, Client$ } from './types'

/**
 * Stream to create an observable BinanceClient depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new BinanceClient will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `none`
 * A BinanceClient will never be created as long as no phrase is available
 */
const clientState$: ClientState$ = Rx.combineLatest([keystoreService.keystore$, clientNetwork$]).pipe(
  mergeMap(
    ([keystore, network]) =>
      new Observable((observer: Observer<ClientState>) => {
        const client: ClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const client = new Client({ phrase, network })
              return O.some(right(client)) as ClientState
            } catch (error) {
              console.log('BNB ClientState error:', error)
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
 * Helper stream to provide "ready-to-go" state of latest `BinanceClient`, but w/o exposing the client
 * It's needed by views only.
 */
const clientViewState$: Observable<ClientStateForViews> = clientState$.pipe(map(getClientStateForViews))

/**
 * Current `Address` depending on selected network
 */
const address$: Address$ = C.address$(client$)

/**
 * Current `Address` depending on selected network
 */
const addressUI$: Address$ = C.addressUI$(client$)

/**
 * Explorer url depending on selected network
 */
const explorerUrl$: ExplorerUrl$ = C.explorerUrl$(client$)

/**
 * Explorer url depending on selected network
 */
const getExplorerTxUrl$: GetExplorerTxUrl$ = C.getExplorerTxUrl$(client$)

/**
 * Explorer url depending on selected network
 */
const getExplorerAddressUrl$: GetExplorerAddressUrl$ = C.getExplorerAddressUrl$(client$)

export {
  client$,
  clientState$,
  clientViewState$,
  address$,
  addressUI$,
  explorerUrl$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$
}
