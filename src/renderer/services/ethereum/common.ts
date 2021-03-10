import { Network as ClientNetwork } from '@xchainjs/xchain-client'
import { Client } from '@xchainjs/xchain-ethereum'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay } from 'rxjs/operators'

import { envOrDefault } from '../../helpers/envHelper'
import { network$ } from '../app/service'
import * as C from '../clients'
import { Address$, ExplorerUrl$, GetExplorerTxUrl$, GetExplorerAddressUrl$ } from '../clients/types'
import { ClientStateForViews } from '../clients/types'
import { getClient, getClientStateForViews } from '../clients/utils'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { ClientState, ClientState$, Client$ } from './types'

/**
 * Ethereum network depending on `Network`
 */
const ethereumNetwork$: Observable<ClientNetwork> = network$.pipe(
  map((network) => {
    if (network === 'chaosnet') return 'mainnet'

    return network
  })
)

const ETHERSCAN_API_KEY = envOrDefault(process.env.REACT_APP_ETHERSCAN_API_KEY, '')
const INFURA_PROJECT_ID = envOrDefault(process.env.REACT_APP_INFURA_PROJECT_ID, '')

/**
 * Stream to create an observable EthereumClient depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new EthereumClient will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `none`
 * A EthereumClient will never be created as long as no phrase is available
 */
const clientState$: ClientState$ = Rx.combineLatest([keystoreService.keystore$, ethereumNetwork$]).pipe(
  mergeMap(
    ([keystore, network]) =>
      new Observable((observer: Observer<ClientState>) => {
        const client: ClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const infuraCreds = INFURA_PROJECT_ID
                ? {
                    infuraCreds: {
                      projectId: INFURA_PROJECT_ID
                    }
                  }
                : {}
              const client = new Client({
                network,
                etherscanApiKey: ETHERSCAN_API_KEY,
                phrase,
                ...infuraCreds
              })
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
 * Helper stream to provide "ready-to-go" state of latest `EthereumClient`, but w/o exposing the client
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
