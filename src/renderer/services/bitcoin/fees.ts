import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient, getDefaultFeesWithRates } from '@xchainjs/xchain-bitcoin'
import { BTCChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Memo } from '../chain/types'
import * as C from '../clients'
import { Client$, FeesWithRatesRD } from './types'
import { FeesService, FeesWithRatesLD } from './types'

/**
 * The only thing we export from this module is this factory
 * and it's called by `./context.ts` only once
 * ^ That's needed to "inject" same reference of `client$` used by other modules into this module
 */
export const createFeesService = (client$: Client$): FeesService<undefined> => {
  const baseFeesService = C.createFeesService<undefined>({ client$, chain: BTCChain })

  /**
   * Observable to load transaction fees
   */
  const loadFees$ = (client: BitcoinClient, memo?: string): FeesWithRatesLD =>
    Rx.from(client.getFeesWithRates(memo)).pipe(
      RxOp.map(RD.success),
      RxOp.catchError(() => Rx.of(RD.success(getDefaultFeesWithRates()))),
      RxOp.startWith(RD.pending)
    )

  /**
   * Transaction fees (memo optional)
   */
  const feesWithRates$ = (memo?: Memo): FeesWithRatesLD =>
    Rx.combineLatest([client$, baseFeesService.reloadFees$]).pipe(
      RxOp.switchMap(([oClient]) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of<FeesWithRatesRD>(RD.initial),
            (client) => FP.pipe(loadFees$(client, memo), RxOp.shareReplay(1))
          )
        )
      )
    )

  return {
    ...baseFeesService,
    feesWithRates$
  }
}
