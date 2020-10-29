import * as RD from '@devexperts/remote-data-ts'
import { Chain, BaseAmount } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { BASE_CHAIN } from '../../../const'
import { LiveData } from '../../../helpers/rx/liveData'
import { triggerStream } from '../../../helpers/stateHelper'
import * as BNB from '../../binance/service'
import { selectedPoolChain$ } from '../../midgard/common'
import { FeeLD, UnstakeFeeLD } from '../types'
import { reloadStakeFeesByChain } from './fees.helper'

// const { get$: unstakePercent$, set: updateUnstakePercent } = observableState(0)

// `TriggerStream` to reload unstake fees
const { stream$: reloadUnstakeFees$, trigger: reloadUnstakeFees } = triggerStream()

/**
 * reload fees
 *
 * Has to be used ONLY on an appopriate screen
 * @example
 * useSubscription(updateUnstakeFeesEffect$) - ONLY
 */
const updateUnstakeFeesEffect$ = Rx.combineLatest([selectedPoolChain$, reloadUnstakeFees$]).pipe(
  RxOp.tap(([oChain, _]) =>
    FP.pipe(
      oChain,
      O.map(() => {
        // reload base-chain
        reloadStakeFeesByChain(BASE_CHAIN)
        return true
      })
    )
  )
)

const unstakeFeeByChain$ = (chain: Chain): FeeLD => {
  // Calculate fees only for base chain (THOR or BNB)
  switch (chain) {
    case 'BNB':
      return FP.pipe(
        reloadUnstakeFees$,
        RxOp.switchMap(() => BNB.stakeFee$)
      )

    case 'THOR':
      return Rx.of(RD.failure(new Error(`Unstake fee for ${chain.toUpperCase()} has not been implemented`)))

    case 'BTC':
    case 'ETH':
      return Rx.of(RD.failure(Error(`${chain.toUpperCase} is not a base chain`)))
  }
}

const unstakeFees$: UnstakeFeeLD = FP.pipe(
  selectedPoolChain$,
  RxOp.switchMap(
    FP.flow(
      O.map(() => unstakeFeeByChain$(BASE_CHAIN)),
      O.getOrElse((): LiveData<Error, BaseAmount> => Rx.of(RD.initial))
    )
  )
)

export { reloadUnstakeFees, unstakeFees$, updateUnstakeFeesEffect$ }
