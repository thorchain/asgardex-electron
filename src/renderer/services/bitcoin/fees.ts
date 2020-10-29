import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@thorchain/asgardex-bitcoin'
import { baseAmount } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, mergeMap, shareReplay, startWith, switchMap } from 'rxjs/operators'

import { BTC_DECIMAL } from '../../helpers/assetHelper'
import { liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import { FeeLD, Memo } from '../chain/types'
import { Client$ } from './common'
import { FeesService, FeesLD, FeeRateLD } from './types'

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
  const loadFees$ = (client: BitcoinClient, memo?: string): FeesLD =>
    Rx.from(client.calcFees(memo)).pipe(
      map(RD.success),
      catchError((error) => Rx.of(RD.failure(error))),
      startWith(RD.pending)
    )

  /**
   * Transaction fees (no memo included)
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
   * Transaction fees (memo included)
   */
  const memoFees$ = (memo: Memo): FeesLD =>
    Rx.combineLatest([oClient$, reloadFees$]).pipe(
      mergeMap(([oClient]) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial) as FeesLD,
            (client) => loadFees$(client, memo)
          )
        )
      ),
      shareReplay(1)
    )

  // `TriggerStream` to reload stake `fees`
  const { stream$: reloadStakeFee$, trigger: reloadStakeFee } = triggerStream()

  /**
   * Factory to create a stream of stake fees
   * @param memo Memo used for deposit transactions
   */
  const stakeFee$ = (memo: Memo): FeeLD =>
    FP.pipe(
      reloadStakeFee$,
      switchMap(() => memoFees$(memo)),
      liveData.map((fees) => baseAmount(fees.fast.feeTotal, BTC_DECIMAL))
    )

  /**
   * Factory to create a stream of stake fees
   * @param memo Memo used for deposit transactions
   */
  const stakeFeeRate$ = (memo: Memo): FeeRateLD =>
    FP.pipe(
      reloadStakeFee$,
      switchMap(() => memoFees$(memo)),
      liveData.map((fees) => fees.fast.feeRate)
    )

  return {
    fees$,
    stakeFee$,
    stakeFeeRate$,
    reloadFees,
    reloadStakeFee
  }
}
