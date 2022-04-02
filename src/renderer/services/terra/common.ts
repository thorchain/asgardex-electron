import * as RD from '@devexperts/remote-data-ts'
import { Client, getDefaultClientConfig, getTerraChains, mergeChainIds } from '@xchainjs/xchain-terra'
import { TerraChain } from '@xchainjs/xchain-util'
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

/**
 * Stream to create an observable `TerraClient` depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new `TerraClient` will be created.
 * By the other hand: Whenever a phrase has been removed, `ClientState` is set to `initial`
 * A `TerraClient` will never be created as long as no phrase is available
 */
const clientState$: ClientState$ = FP.pipe(
  Rx.combineLatest([keystoreService.keystore$, clientNetwork$]),
  RxOp.switchMap(
    ([keystore, network]): ClientState$ =>
      FP.pipe(
        // request chain ids
        Rx.from(getTerraChains()),
        // merge chain ids into default config
        RxOp.switchMap((chainIds) => Rx.of(mergeChainIds(chainIds, getDefaultClientConfig()))),
        RxOp.catchError((error: Error) =>
          Rx.of(
            RD.failure<Error>(new Error(`Failed to get chain id for Terra (${error?.message ?? error.toString()})`))
          )
        ),
        // use default values if
        RxOp.switchMap((config) =>
          Rx.of(
            FP.pipe(
              getPhrase(keystore),
              O.map<string, ClientState>((phrase) => {
                try {
                  const client = new Client({
                    ...config,
                    network,
                    phrase
                  })
                  return RD.success(client)
                } catch (error) {
                  return RD.failure<Error>(isError(error) ? error : new Error('Failed to create Terra client'))
                }
              }),
              // Set back to `initial` if no phrase is available (locked wallet)
              O.getOrElse<ClientState>(() => RD.initial)
            )
          )
        ),
        RxOp.startWith(RD.pending)
      )
  ),
  RxOp.startWith<ClientState>(RD.initial),
  RxOp.shareReplay(1)
)

const client$: Client$ = clientState$.pipe(RxOp.map(RD.toOption), RxOp.shareReplay(1))

/**
 * `Address`
 */
const address$: C.WalletAddress$ = C.address$(client$, TerraChain)

/**
 * `Address`
 */
const addressUI$: C.WalletAddress$ = C.addressUI$(client$, TerraChain)

/**
 * Explorer url depending on selected network
 */
const explorerUrl$: C.ExplorerUrl$ = C.explorerUrl$(client$)

export { client$, clientState$, address$, addressUI$, explorerUrl$ }
