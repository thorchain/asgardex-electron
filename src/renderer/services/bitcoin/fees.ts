import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@thorchain/asgardex-bitcoin'
import { baseAmount } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, mergeMap, shareReplay, startWith } from 'rxjs/operators'

import { BTC_DECIMAL } from '../../helpers/assetHelper'
import { liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import { FeeLD } from '../chain/types'
import { Client$ } from './common'
import { FeesService, FeesLD } from './types'

// reference to current client$
const oClient$ = Rx.identity

// `TriggerStream` to reload `fees`
const { stream$: reloadFees$, trigger: reloadFees } = triggerStream()

/**
 * Observable to load transaction fees
 * If a client is not available, it returns an `initial` state
 */
const loadFees$ = (client: BitcoinClient, memo?: string): FeesLD =>
  Rx.from(client.calcFees(memo)).pipe(
    map(RD.success),
    catchError((error) => Rx.of(RD.failure(error))),
    startWith(RD.pending)
  )

/**
 * Transaction fees
 * If a client is not available, it returns `None`
 */
const fees$: FeesLD = Rx.combineLatest([oClient$, reloadFees$]).pipe(
  mergeMap(([oClient, _]) =>
    FP.pipe(
      oClient,
      O.fold(() => Rx.of(RD.initial), loadFees$)
    )
  ),
  shareReplay(1)
)

/**
 * Fee for fast tx
 */
const fastTxFee$: FeeLD = FP.pipe(
  fees$,
  liveData.map((fees) => baseAmount(fees.fast.feeTotal, BTC_DECIMAL))
)

/**
 * Fee for fast tx
 */
const stakeFee$: FeeLD = fastTxFee$.pipe(Rx.identity)

/**
 * The only thing we export from this module is this factory
 * and it's called by `./context.ts` only once
 * ^ That's needed to "inject" same reference of `client$` used by other modules into this module
 */
export const createFeesService = (client$: Client$): FeesService => {
  // set client FIRST!!!
  // Needed by other streams in this module
  oClient$(client$)

  return {
    fees$,
    stakeFee$,
    reloadFees
  }
}
