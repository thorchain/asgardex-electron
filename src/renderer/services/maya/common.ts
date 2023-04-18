import * as RD from '@devexperts/remote-data-ts'
import { Client, MAYAChain } from '@xchainjs/xchain-mayachain'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { getChainId } from '../../../shared/api/maya'
import { getClientUrls, INITIAL_CHAIN_IDS } from '../../../shared/maya/client'
import { isError } from '../../../shared/utils/guard'
import { clientNetwork$ } from '../app/service'
import * as C from '../clients'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import type { Client$, ClientState, ClientState$ } from './types'

/**
 * Stream to create an observable `CosmosClient` depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new `CosmosClient` will be created.
 * By the other hand: Whenever a phrase has been removed, `ClientState` is set to `initial`
 * A `CosmosClient` will never be created as long as no phrase is available
 */

// const rpcURL = 'https://api.cosmos.network'
const clientState$: ClientState$ = FP.pipe(
  Rx.combineLatest([keystoreService.keystoreState$, clientNetwork$, Rx.of(getClientUrls())]),
  RxOp.switchMap(
    ([keystore, network, clientUrls]): ClientState$ =>
      FP.pipe(
        // request chain id whenever network or keystore have been changed
        Rx.from(getChainId(clientUrls[network])()),
        // Rx.from(getChainId(rpcURL)()),
        RxOp.switchMap((eChainId) =>
          FP.pipe(
            eChainId,
            E.fold(
              (error) =>
                Rx.of(RD.failure(Error(`Failed to get Maya chain id (${error?.message ?? error.toString()})`))),
              (chainId) =>
                Rx.of(
                  FP.pipe(
                    getPhrase(keystore),
                    O.map<string, ClientState>((phrase) => {
                      try {
                        const settings = {
                          phrase: phrase,
                          network: network,
                          chainIds: { ...INITIAL_CHAIN_IDS, [network]: chainId }
                        }

                        const client = new Client(
                          settings

                          // clientUrls: getClientUrls(),
                          // clientUrls: { ...getClientUrls(), [network]: rpcURL },
                        )
                        return RD.success(client)
                      } catch (error) {
                        return RD.failure<Error>(isError(error) ? error : new Error('Failed to create Maya client'))
                      }
                    }),
                    // Set back to `initial` if no phrase is available (locked wallet)
                    O.getOrElse<ClientState>(() => RD.initial)
                  )
                )
            )
          )
        ),
        RxOp.startWith(RD.pending)
      )
  ),
  RxOp.startWith(RD.initial),
  RxOp.shareReplay(1)
)

const client$: Client$ = clientState$.pipe(RxOp.map(RD.toOption), RxOp.shareReplay(1))

/**
 * `Address`
 */
const address$: C.WalletAddress$ = C.address$(client$, MAYAChain)

/**
 * `Address`
 */
const addressUI$: C.WalletAddress$ = C.addressUI$(client$, MAYAChain)

/**
 * Explorer url depending on selected network
 */
const explorerUrl$: C.ExplorerUrl$ = C.explorerUrl$(client$)

export { client$, clientState$, address$, addressUI$, explorerUrl$ }
