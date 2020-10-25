import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@thorchain/asgardex-bitcoin'
import { baseAmount, getDepositMemo } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, mergeMap, shareReplay, startWith } from 'rxjs/operators'

import { BTC_DECIMAL } from '../../helpers/assetHelper'
import { isBtcChain } from '../../helpers/chainHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import { FeeLD } from '../chain/types'
import { selectedPoolAsset$ } from '../midgard/common'
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
   * @param address Address of user's wallet address for base chain
   */
  const stakeFee$ = (address: string): FeeLD =>
    Rx.combineLatest([oClient$, selectedPoolAsset$, reloadStakeFee$]).pipe(
      mergeMap(([oClient, oAsset]) =>
        FP.pipe(
          sequenceTOption(oClient, oAsset),
          O.fold(
            () => Rx.of(RD.initial),
            ([client, asset]) => {
              // load fees for asset on BTC chain only
              console.log('getDepositMemo(asset, address):', getDepositMemo(asset, address))
              // memo: STAKE:BTC.BTC:BASE_CHAIN_ADDRESS
              if (isBtcChain(asset.chain)) return loadFees$(client, getDepositMemo(asset, address))
              return Rx.of(RD.initial)
            }
          )
        )
      ),
      // extract fast fee only
      liveData.map((fees) => baseAmount(fees.fast.feeTotal, BTC_DECIMAL)),
      shareReplay(1)
    )

  return {
    fees$,
    stakeFee$,
    reloadFees,
    reloadStakeFee
  }
}
