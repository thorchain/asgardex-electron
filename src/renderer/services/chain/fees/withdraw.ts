import * as RD from '@devexperts/remote-data-ts'
import { Chain, BaseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { BASE_CHAIN } from '../../../const'
import { LiveData } from '../../../helpers/rx/liveData'
import { triggerStream } from '../../../helpers/stateHelper'
import * as BNB from '../../binance/service'
import { selectedPoolChain$ } from '../../midgard/common'
import { FeeLD, WithdrawFeeLD } from '../types'
import { reloadStakeFeesByChain } from './fees.helper'

// `TriggerStream` to reload withdraw fees
const { stream$: reloadWithdrawFees$, trigger: reloadWithdrawFees } = triggerStream()

/**
 * reload fees
 *
 * Has to be used ONLY on an appropriate screen
 * @example
 * useSubscription(updateWithdrawFeesEffect$)
 */
const updateWithdrawFeesEffect$ = Rx.combineLatest([selectedPoolChain$, reloadWithdrawFees$]).pipe(
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

const withdrawFeeByChain$ = (chain: Chain): FeeLD => {
  // Calculate fees only for base chain (THOR or BNB)
  switch (chain) {
    case 'BNB':
      return FP.pipe(
        reloadWithdrawFees$,
        RxOp.switchMap(() => BNB.stakeFee$)
      )

    case 'THOR':
      return Rx.of(RD.failure(new Error(`Withdraw fee for ${chain.toUpperCase()} has not been implemented`)))

    case 'BTC':
    case 'ETH':
      return Rx.of(RD.failure(Error(`${chain.toUpperCase} is not a base chain`)))
  }
}

const withdrawFees$: WithdrawFeeLD = FP.pipe(
  selectedPoolChain$,
  RxOp.switchMap(
    FP.flow(
      O.map(() => withdrawFeeByChain$(BASE_CHAIN)),
      O.getOrElse((): LiveData<Error, BaseAmount> => Rx.of(RD.initial))
    )
  )
)

export { reloadWithdrawFees, withdrawFees$, updateWithdrawFeesEffect$ }
