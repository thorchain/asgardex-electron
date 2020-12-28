import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient, getDefaultFeesWithRates } from '@xchainjs/xchain-bitcoin'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, mergeMap, shareReplay, startWith, switchMap, tap } from 'rxjs/operators'

import { liveData } from '../../helpers/rx/liveData'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { FeeLD, Memo } from '../chain/types'
import { Client$ } from './types'
import { FeesService, FeeRateLD, FeeRateRD, FeesWithRatesLD } from './types'

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
      map(RD.success),
      catchError(() => Rx.of(RD.success(getDefaultFeesWithRates()))),
      startWith(RD.pending)
    )

  /**
   * Transaction fees (no memo included)
   */
  const fees$: FeesWithRatesLD = Rx.combineLatest([oClient$, reloadFees$]).pipe(
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
  const memoFees$ = (memo: Memo): FeesWithRatesLD =>
    Rx.combineLatest([oClient$, reloadFees$]).pipe(
      switchMap(([oClient]) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial) as FeesWithRatesLD,
            (client) => loadFees$(client, memo)
          )
        )
      ),
      shareReplay(1)
    )

  // `TriggerStream` to reload deposit `fees`
  const { stream$: reloadDepositFee$, trigger: reloadDepositFee } = triggerStream()

  /**
   * Factory to create a stream for pool fees (deposit / withdraw)
   * @param memo Memo used for pool transactions
   */
  const poolFee$ = (memo: Memo): FeeLD =>
    FP.pipe(
      reloadDepositFee$,
      switchMap(() => memoFees$(memo)),
      liveData.map(({ fees }) => fees.fast)
    )

  const { get: getPoolFeeRate, set: setPoolFeeRate } = observableState<FeeRateRD>(RD.initial)
  /**
   * Factory to create a stream of fees for pool transacions
   * @param memo Memo used for pool transactions
   */
  const poolFeeRate$ = (memo: Memo): FeeRateLD =>
    FP.pipe(
      reloadDepositFee$,
      switchMap(() => memoFees$(memo)),
      liveData.map(({ rates }) => rates.fast),
      // we do need to store result in a subject to access it w/o subscribing a stream
      tap(setPoolFeeRate)
    )

  return {
    fees$,
    poolFee$,
    memoFees$,
    poolFeeRate$,
    getPoolFeeRate,
    reloadFees,
    reloadDepositFee
  }
}
