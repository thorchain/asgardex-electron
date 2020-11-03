import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@thorchain/asgardex-bitcoin'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, mergeMap, shareReplay, startWith, switchMap } from 'rxjs/operators'

import { BTC_DECIMAL } from '../../helpers/assetHelper'
import { liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import { FeeLD, Memo } from '../chain/types'
import { Client$ } from './common'
import { FeesService, FeesLD } from './types'

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

  // `TriggerStream` to reload stake `fees`
  const { stream$: reloadStakeFee$, trigger: reloadStakeFee } = triggerStream()

  /**
   * Factory to create a stream of stake fees
   * @param memo Memo used for deposit transactions
   */
  const stakeFee$ = (memo: Memo): FeeLD =>
    Rx.combineLatest([oClient$, reloadStakeFee$]).pipe(
      switchMap(([oClient]) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial),
            (client) => loadFees$(client, memo)
          )
        )
      ),
      // extract fast fee only
      liveData.map((fees) => baseAmount(fees.fast.feeTotal, BTC_DECIMAL))
    )

  return {
    fees$,
    stakeFee$,
    reloadFees,
    reloadStakeFee
  }
}
