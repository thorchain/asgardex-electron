import * as RD from '@devexperts/remote-data-ts'
import { Chain, BaseAmount } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { BASE_CHAIN } from '../../../const'
import { isBaseChain } from '../../../helpers/chainHelper'
import { liveData, LiveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import * as BNB from '../../binance/service'
import * as BTC from '../../bitcoin/context'
import { selectedPoolChain$ } from '../../midgard/common'
import { getCrossChainUnstakeMemo$ } from '../memo'
import { FeeLD, StakeFeesLD } from '../types'
import { reloadStakeFeesByChain } from './fees.helper'

const { get$: unstakePercent$, set: updateUnstakePercent } = observableState(0)

// reload fees
const updateUnstakeFeesEffect$ = Rx.combineLatest([selectedPoolChain$, unstakePercent$]).pipe(
  RxOp.tap(([oChain, _]) =>
    FP.pipe(
      oChain,
      O.map((chain) => {
        // reload base-chain
        reloadStakeFeesByChain(BASE_CHAIN)
        // For x-chains transfers, load fees for x-chain, too
        if (!isBaseChain(chain)) reloadStakeFeesByChain(chain)
        return true
      })
    )
  )
)

const unstakeFeeByChain$ = (chain: Chain): FeeLD => {
  switch (chain) {
    case 'BNB':
      return FP.pipe(
        unstakePercent$,
        RxOp.switchMap(() => BNB.stakeFee$)
      )

    case 'BTC':
      // unstake fees of BTC based on memo
      return FP.pipe(
        unstakePercent$,
        RxOp.switchMap(getCrossChainUnstakeMemo$),
        RxOp.switchMap(O.fold(() => Rx.of(RD.initial), BTC.stakeFee$))
      )
    case 'ETH':
    case 'THOR':
      return Rx.of(RD.failure(new Error(`Unstake fee for ${chain.toUpperCase()} has not been implemented`)))
  }
}

const unstakeFees$: StakeFeesLD = FP.pipe(
  selectedPoolChain$,
  RxOp.switchMap(
    FP.flow(
      O.map((chain) =>
        isBaseChain(chain)
          ? // fee for base chain is needed only
            [unstakeFeeByChain$(BASE_CHAIN)]
          : // for x-chain unstake, we do need to load fees for base- AND x-chain,
            [unstakeFeeByChain$(BASE_CHAIN), unstakeFeeByChain$(chain)]
      ),
      O.map(liveData.sequenceArray),
      O.getOrElse((): LiveData<Error, BaseAmount[]> => Rx.of(RD.initial)),
      liveData.map(([base, cross]) => ({
        base,
        cross: O.fromNullable(cross)
      }))
    )
  )
)

export { updateUnstakePercent, unstakeFees$, updateUnstakeFeesEffect$ }
