import * as RD from '@devexperts/remote-data-ts'
import { Client, NodeAuth } from '@xchainjs/xchain-litecoin'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { envOrDefault } from '../../helpers/envHelper'
import { clientNetwork$ } from '../app/service'
import * as C from '../clients'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { Client$, ClientState$, ClientState } from './types'

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
 * Stream to create an observable `LitecoinClient` depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new `LitecoinClient` will be created.
 * By the other hand: Whenever a phrase has been removed, `ClientState` is set to `initial`
 * A `LitecoinClient` will never be created as long as no phrase is available
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
              const nodeUrl = network === 'mainnet' ? LTC_NODE_MAINNET_URL : LTC_NODE_TESTNET_URL
              const client = new Client({
                network,
                phrase,
                nodeUrl,
                nodeAuth: NODE_AUTH
              })
              return RD.success(client)
            } catch (error) {
              console.error('Failed to create LTC client', error)
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

const client$: Client$ = clientState$.pipe(RxOp.map(RD.toOption), RxOp.shareReplay(1))

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
