import { Client as BitcoinCashClient, ClientUrl, NodeAuth } from '@xchainjs/xchain-bitcoincash'
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
  testnet: envOrDefault(process.env.REACT_APP_HASKOIN_TESTNET_URL, 'https://api.haskoin.com/bchtest'),
  mainnet: envOrDefault(process.env.REACT_APP_HASKOIN_MAINNET_URL, 'https://api.haskoin.com/bch')
}

const NODE_URL: ClientUrl = {
  testnet: envOrDefault(process.env.REACT_APP_BCH_NODE_TESTNET_URL, 'https://testnet.bch.thorchain.info'),
  mainnet: envOrDefault(process.env.REACT_APP_BCH_NODE_MAINNET_URL, 'https://mainnet.bch.thorchain.info')
}

const NODE_AUTH: NodeAuth = {
  password: envOrDefault(process.env.REACT_APP_BCH_NODE_PASSWORD, 'password'),
  username: envOrDefault(process.env.REACT_APP_BCH_NODE_USERNAME, 'thorchain')
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
                haskoinUrl: HASKOIN_API_URL,
                nodeUrl: NODE_URL,
                nodeAuth: NODE_AUTH,
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

/**
 * BCH `Address`
 */
const addressUI$: C.Address$ = C.addressUI$(client$)

/**
 * Explorer url
 */
const explorerUrl$: C.ExplorerUrl$ = C.explorerUrl$(client$)

/**
 * Explorer tx url
 */
const getExplorerTxUrl$: C.GetExplorerTxUrl$ = C.getExplorerTxUrl$(client$)

/**
 * Explorer address url
 */
const getExplorerAddressUrl$: GetExplorerAddressUrl$ = C.getExplorerAddressUrl$(client$)

export { address$, addressUI$, client$, clientViewState$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ }
