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
import { Address$, ExplorerUrl$, GetExplorerTxUrl$ } from '../clients/types'
import { ClientStateForViews } from '../clients/types'
import { getClientStateForViews, getClient } from '../clients/utils'
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
      new Observable((observer: Observer<ClientState>) => {
        const client: ClientState = FP.pipe(
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

const client$: Observable<O.Option<BitcoinClient>> = clientState$.pipe(map(getClient), shareReplay(1))

/**
 * Helper stream to provide "ready-to-go" state of latest `BitcoinClient`, but w/o exposing the client
 * It's needed by views only.
 */
const clientViewState$: Observable<ClientStateForViews> = clientState$.pipe(map(getClientStateForViews))

/**
 * Current `Address` depending on selected network
 */
const address$: Address$ = C.address$(client$)

/**
 * Explorer url depending on selected network
 */
const explorerUrl$: ExplorerUrl$ = C.explorerUrl$(client$)
/**
 * Explorer url depending on selected network
 */
const getExplorerTxUrl$: GetExplorerTxUrl$ = C.getExplorerTxUrl$(client$)

export { client$, clientViewState$, address$, explorerUrl$, getExplorerTxUrl$ }
