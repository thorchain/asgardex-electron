import * as RD from '@devexperts/remote-data-ts'
import { Network } from '@xchainjs/xchain-client'
import { Client, getDefaultClientUrls } from '@xchainjs/xchain-cosmos'
import { CosmosChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { isError } from '../../../shared/utils/guard'
import { clientNetwork$ } from '../app/service'
import * as C from '../clients'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import type { Client$, ClientState, ClientState$ } from './types'

const clientUrl = 'https://lcd-cosmoshub.keplr.app'

/**
 * Stream to create an observable `CosmosClient` depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new `CosmosClient` will be created.
 * By the other hand: Whenever a phrase has been removed, `ClientState` is set to `initial`
 * A `CosmosClient` will never be created as long as no phrase is available
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
              const client = new Client({
                network,
                phrase,
                clientUrls: {
                  ...getDefaultClientUrls(),
                  [Network.Stagenet]: clientUrl,
                  [Network.Mainnet]: clientUrl
                }
              })
              return RD.success(client)
            } catch (error) {
              return RD.failure<Error>(isError(error) ? error : new Error('Failed to create Cosmos client'))
            }
          }),
          // Set back to `initial` if no phrase is available (locked wallet)
          O.getOrElse<ClientState>(() => RD.initial)
        )
      )
  ),
  RxOp.startWith<ClientState>(RD.initial),
  RxOp.shareReplay(1)
)

const client$: Client$ = clientState$.pipe(RxOp.map(RD.toOption), RxOp.shareReplay(1))

/**
 * `Address`
 */
const address$: C.WalletAddress$ = C.address$(client$, CosmosChain)

/**
 * `Address`
 */
const addressUI$: C.WalletAddress$ = C.addressUI$(client$, CosmosChain)

/**
 * Explorer url depending on selected network
 */
const explorerUrl$: C.ExplorerUrl$ = C.explorerUrl$(client$)

export { client$, clientState$, address$, addressUI$, explorerUrl$ }
