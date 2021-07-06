import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinCashClient, ClientUrl, NodeAuth } from '@xchainjs/xchain-bitcoincash'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import * as RxOp from 'rxjs/operators'
import { map, shareReplay } from 'rxjs/operators'

import { envOrDefault } from '../../helpers/envHelper'
import { clientNetwork$ } from '../app/service'
import * as C from '../clients'
import { GetExplorerAddressUrl$ } from '../clients'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { ClientState, ClientState$ } from './types'

const HASKOIN_API_URL: ClientUrl = {
  testnet: envOrDefault(process.env.REACT_APP_HASKOIN_TESTNET_URL, 'https://api.haskoin.com/bchtest'),
  mainnet: envOrDefault(process.env.REACT_APP_HASKOIN_MAINNET_URL, 'https://api.haskoin.com/bch')
}

const NODE_URL: ClientUrl = {
  testnet: envOrDefault(process.env.REACT_APP_BCH_NODE_TESTNET_URL, 'https://testnet.bch.thorchain.info'),
  mainnet: envOrDefault(process.env.REACT_APP_BCH_NODE_MAINNET_URL, 'https://bch.thorchain.info')
}

const NODE_AUTH: NodeAuth = {
  password: envOrDefault(process.env.REACT_APP_BCH_NODE_PASSWORD, 'password'),
  username: envOrDefault(process.env.REACT_APP_BCH_NODE_USERNAME, 'thorchain')
}

/**
 * Stream to create an observable `BitcoinCashClient` depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new `BitcoinCashClient` will be created.
 * By the other hand: Whenever a phrase has been removed, `ClientState` is set to `initial`
 * A `BitcoinCashClient` will never be created as long as no phrase is available
 */
const clientState$: ClientState$ = FP.pipe(
  Rx.combineLatest([keystoreService.keystore$, clientNetwork$]),
  RxOp.switchMap(
    ([keystore, network]): ClientState$ =>
      Rx.of(
        FP.pipe(
          getPhrase(keystore),
          O.map<string, ClientState>((phrase) => {
            try {
              const client = new BitcoinCashClient({
                network,
                haskoinUrl: HASKOIN_API_URL,
                nodeUrl: NODE_URL,
                nodeAuth: NODE_AUTH,
                phrase
              })
              return RD.success(client)
            } catch (error) {
              console.error('Failed to create BCH client', error)
              return RD.failure(error)
            }
          }),
          // Set back to `initial` if no phrase is available (locked wallet)
          O.getOrElse<ClientState>(() => RD.initial)
        )
      ).pipe(RxOp.startWith(RD.pending))
  ),
  RxOp.startWith<ClientState>(RD.initial),
  RxOp.shareReplay(1)
)

const client$: Observable<O.Option<BitcoinCashClient>> = clientState$.pipe(map(RD.toOption), shareReplay(1))

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
