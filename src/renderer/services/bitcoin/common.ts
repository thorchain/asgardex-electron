import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient, ClientUrl } from '@xchainjs/xchain-bitcoin'
import { BTCChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { envOrDefault } from '../../../shared/utils/env'
import { isError } from '../../../shared/utils/guard'
import { clientNetwork$ } from '../app/service'
import * as C from '../clients'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { ClientState, ClientState$ } from './types'

const APP_HASKOIN_MAINNET_URL = envOrDefault(
  process.env.REACT_APP_HASKOIN_BTC_MAINNET_URL,
  'https://api.haskoin.com/btc'
)

const HASKOIN_API_URL: ClientUrl = {
  testnet: envOrDefault(process.env.REACT_APP_HASKOIN_BTC_TESTNET_URL, 'https://api.haskoin.com/btctest'),
  stagenet: APP_HASKOIN_MAINNET_URL,
  mainnet: APP_HASKOIN_MAINNET_URL
}

/**
 * Stream to create an observable BitcoinClient depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new `BitcoinClient` will be created.
 * By the other hand: Whenever a phrase has been removed, `ClientState` is set to `initial`
 * A `BitcoinClient` will never be created as long as no phrase is available
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
              const client = new BitcoinClient({
                network,
                phrase,
                haskoinUrl: HASKOIN_API_URL
              })
              return RD.success(client)
            } catch (error) {
              console.error('Failed to create BTC client', error)
              return RD.failure<Error>(isError(error) ? error : new Error('Unknown error'))
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

const client$: Observable<O.Option<BitcoinClient>> = clientState$.pipe(RxOp.map(RD.toOption), RxOp.shareReplay(1))

/**
 * BTC `Address`
 */
const address$: C.WalletAddress$ = C.address$(client$, BTCChain)

/**
 * BTC `Address`
 */
const addressUI$: C.WalletAddress$ = C.addressUI$(client$, BTCChain)

/**
 * Explorer url depending on selected network
 */
const explorerUrl$: C.ExplorerUrl$ = C.explorerUrl$(client$)

export { client$, clientState$, address$, addressUI$, explorerUrl$ }
