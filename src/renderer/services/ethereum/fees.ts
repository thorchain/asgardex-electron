import * as RD from '@devexperts/remote-data-ts'
import {
  Client as EthereumClient,
  estimateDefaultFeesWithGasPricesAndLimits,
  FeesParams
} from '@xchainjs/xchain-ethereum'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { triggerStream } from '../../helpers/stateHelper'
import { Client$, FeesWithGasPricesAndLimitsRD } from './types'
import { FeesService, FeesWithGasPricesAndLimitsLD } from './types'

/**
 * The only thing we export from this module is this factory
 * and it's called by `./context.ts` only once
 * ^ That's needed to "inject" same reference of `client$` used by other modules into this module
 */
export const createFeesService = (oClient$: Client$): FeesService => {
  // `TriggerStream` to reload `fees`
  const { stream$: reloadFees$, trigger: reloadFees } = triggerStream()

  /**
   * Observable to load transaction fees
   * If a client is not available, it returns an `initial` state
   */
  const loadFees$ = (client: EthereumClient, params: FeesParams): FeesWithGasPricesAndLimitsLD =>
    Rx.from(client.estimateFeesWithGasPricesAndLimits(params)).pipe(
      RxOp.map(RD.success),
      RxOp.catchError(() => Rx.of(RD.success(estimateDefaultFeesWithGasPricesAndLimits(params.asset)))),
      RxOp.startWith(RD.pending)
    )

  /**
   * Transaction fees (no memo included)
   */
  const fees$ = (params: FeesParams): FeesWithGasPricesAndLimitsLD =>
    Rx.combineLatest([oClient$, reloadFees$]).pipe(
      RxOp.switchMap(([oClient]) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of<FeesWithGasPricesAndLimitsRD>(RD.initial),
            (client) => loadFees$(client, params)
          )
        )
      ),
      RxOp.shareReplay(1)
    )

  return {
    fees$,
    reloadFees
  }
}
