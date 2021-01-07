import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient, getDefaultFeesWithRates } from '@xchainjs/xchain-bitcoin'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { triggerStream } from '../../helpers/stateHelper'
import { Memo } from '../chain/types'
import { Client$, FeesWithRatesRD } from './types'
import { FeesService, FeesWithRatesLD } from './types'

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
  const loadFees$ = (client: BitcoinClient, memo?: string): FeesWithRatesLD =>
    Rx.from(client.getFeesWithRates(memo)).pipe(
      RxOp.map(RD.success),
      RxOp.catchError(() => Rx.of(RD.success(getDefaultFeesWithRates()))),
      RxOp.startWith(RD.pending)
    )

  /**
   * Transaction fees (no memo included)
   */
  const fees$: FeesWithRatesLD = Rx.combineLatest([oClient$, reloadFees$]).pipe(
    RxOp.mergeMap(([oClient, _]) =>
      FP.pipe(
        oClient,
        O.fold(() => Rx.of<FeesWithRatesRD>(RD.initial), loadFees$)
      )
    ),
    RxOp.shareReplay(1)
  )

  /**
   * Transaction fees (memo included)
   */
  const memoFees$ = (memo: Memo): FeesWithRatesLD =>
    Rx.combineLatest([oClient$, reloadFees$]).pipe(
      RxOp.switchMap(([oClient]) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of<FeesWithRatesRD>(RD.initial),
            (client) => loadFees$(client, memo)
          )
        )
      ),
      RxOp.shareReplay(1)
    )

  return {
    fees$,
    memoFees$,
    reloadFees
  }
}
