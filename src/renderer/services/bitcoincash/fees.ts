import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinCashClient, getDefaultFeesWithRates } from '@xchainjs/xchain-bitcoincash'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { BCHChain } from '../../../shared/utils/chain'
import { observableState } from '../../helpers/stateHelper'
import { FeesWithRatesRD } from '../bitcoin/types'
import { Memo } from '../chain/types'
import * as C from '../clients'
import { Client$, FeesService, FeesWithRatesLD } from './types'

export const createFeesService = (client$: Client$): FeesService => {
  const baseFeesService = C.createFeesService({ client$, chain: BCHChain })

  // state for reloading fees+rates
  const { get$: reloadFeesWithRates$, set: reloadFeesWithRates } = observableState<Memo | undefined>(undefined)

  const loadFees$ = (client: BitcoinCashClient, memo?: string): FeesWithRatesLD =>
    Rx.from(client.getFeesWithRates(memo)).pipe(
      RxOp.map(RD.success),
      RxOp.catchError(() => Rx.of(RD.success(getDefaultFeesWithRates()))),
      RxOp.startWith(RD.pending)
    )

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
