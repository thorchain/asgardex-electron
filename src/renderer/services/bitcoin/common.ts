import * as RD from '@devexperts/remote-data-ts'
import { AssetBTC, BTCChain, BTC_DECIMAL, Client as BitcoinClient, defaultBTCParams } from '@xchainjs/xchain-bitcoin'
import { HaskoinNetwork, HaskoinProvider } from '@xchainjs/xchain-utxo-providers'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { getHaskoinBTCApiUrl } from '../../../shared/api/haskoin'
import { isError } from '../../../shared/utils/guard'
import { clientNetwork$ } from '../app/service'
import * as C from '../clients'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { ClientState, ClientState$ } from './types'

/**
 * Stream to create an observable BitcoinClient depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new `BitcoinClient` will be created.
 * By the other hand: Whenever a phrase has been removed, `ClientState` is set to `initial`
 * A `BitcoinClient` will never be created as long as no phrase is available
 */
const clientState$: ClientState$ = FP.pipe(
  Rx.combineLatest([keystoreService.keystoreState$, clientNetwork$]),
  RxOp.switchMap(
    ([keystore, network]): ClientState$ =>
      Rx.of(
        FP.pipe(
          getPhrase(keystore),
          O.map<string, ClientState>((phrase) => {
            try {
              const btcInitParams = {
                ...defaultBTCParams,
                phrase: phrase,
                network: network,
                haskoinProvider: new HaskoinProvider(
                  getHaskoinBTCApiUrl()[network],
                  BTCChain,
                  AssetBTC,
                  BTC_DECIMAL,
                  HaskoinNetwork.BTC
                )
              }
              const client = new BitcoinClient(btcInitParams)
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
