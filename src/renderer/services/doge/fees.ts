import * as RD from '@devexperts/remote-data-ts'
import { Client as DogeClient, getDefaultFeesWithRates } from '@xchainjs/xchain-doge'
import { DOGEChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { Memo } from '../chain/types'
import * as C from '../clients'
import { Client$, FeesWithRatesRD } from './types'
import { FeesService, FeesWithRatesLD } from './types'

export const createFeesService = (client$: Client$): FeesService => {
  const baseFeesService = C.createFeesService({ client$, chain: DOGEChain })

  // state for reloading fees+rates
  const { get$: reloadFeesWithRates$, set: reloadFeesWithRates } = observableState<Memo | undefined>(undefined)

  /**
   * Observable to load transaction fees
   */
  const loadFees$ = (client: DogeClient, memo?: string): FeesWithRatesLD =>
    Rx.from(client.getFeesWithRates(memo)).pipe(
      RxOp.map(RD.success),
      RxOp.catchError(() => Rx.of(RD.success(getDefaultFeesWithRates()))),
      RxOp.startWith(RD.pending)
    )

  /**
   * Transaction fees (memo optional)
   */
  const feesWithRates$ = (memo?: Memo): FeesWithRatesLD =>
    Rx.combineLatest([client$, reloadFeesWithRates$]).pipe(
      RxOp.switchMap(([oClient, reloadMemo]) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of<FeesWithRatesRD>(RD.initial),
            (client) => FP.pipe(loadFees$(client, reloadMemo || memo), RxOp.shareReplay(1))
          )
        )
      )
    )

  return {
    ...baseFeesService,
    reloadFeesWithRates,
    feesWithRates$
  }
}
