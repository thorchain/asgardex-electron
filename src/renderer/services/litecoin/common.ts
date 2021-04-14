import { Client, NodeAuth } from '@xchainjs/xchain-litecoin'
import * as FP from 'fp-ts/function'
import { right, left } from 'fp-ts/lib/Either'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay } from 'rxjs/operators'

import { envOrDefault } from '../../helpers/envHelper'
import { clientNetwork$ } from '../app/service'
import * as C from '../clients'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { Client$, ClientState } from './types'

const LTC_NODE_TESTNET_URL = envOrDefault(
  process.env.REACT_APP_LTC_NODE_TESTNET_URL,
  'https://testnet.ltc.thorchain.info'
)
const LTC_NODE_MAINNET_URL = envOrDefault(process.env.REACT_APP_LTC_NODE_MAINNET_URL, 'https://ltc.thorchain.info')

const NODE_AUTH: NodeAuth = {
  password: envOrDefault(process.env.REACT_APP_LTC_NODE_PASSWORD, 'password'),
  username: envOrDefault(process.env.REACT_APP_LTC_NODE_USERNAME, 'thorchain')
}
/**
 * Stream to create an observable LitecoinClient depending on existing phrase in keystore
 *
 * Whenever a phrase is added to keystore, a new LitecoinClient will be created.
 * By the other hand: Whenever a phrase is removed, the client will be set to `none`
 * A LitecoinClient will never be created if a phrase is not available
 */
const clientState$ = Rx.combineLatest([keystoreService.keystore$, clientNetwork$]).pipe(
  mergeMap(
    ([keystore, network]) =>
      new Observable((observer: Observer<ClientState>) => {
        const client: ClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const nodeUrl = network === 'mainnet' ? LTC_NODE_MAINNET_URL : LTC_NODE_TESTNET_URL
              const client = new Client({
                network,
                phrase,
                nodeUrl,
                nodeAuth: NODE_AUTH
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
 * `Address`
 */
const addressUI$: C.Address$ = C.addressUI$(client$)

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

export { client$, clientState$, address$, addressUI$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ }
