import * as RD from '@devexperts/remote-data-ts'
import { Client as LTCClient, getDefaultFeesWithRates } from '@xchainjs/xchain-litecoin'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { FeesWithRatesRD } from '../bitcoin/types'
import { Memo } from '../chain/types'
import * as C from '../clients'
import { Client$, FeesService, FeesWithRatesLD } from './types'

export const createFeesService: ({ client$, chain }: { client$: Client$; chain: Chain }) => FeesService = ({
  client$,
  chain
}) => {
  const baseClient = C.createFeesService({ client$, chain })

  const loadFees$ = (client: LTCClient, memo?: string): FeesWithRatesLD =>
    Rx.from(client.getFeesWithRates(memo)).pipe(
      RxOp.map(RD.success),
      RxOp.catchError(() => Rx.of(RD.success(getDefaultFeesWithRates()))),
      RxOp.startWith(RD.pending)
    )

  /**
   * Transaction fees
   */
  const feesWithRates$ = (memo?: Memo): FeesWithRatesLD =>
    Rx.combineLatest([client$, baseClient.reloadFeesTrigger$]).pipe(
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
    ...baseClient,
    feesWithRates$
  }
}
