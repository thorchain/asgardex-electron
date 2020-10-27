import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { BASE_CHAIN } from '../../../const'
import { isBaseChain } from '../../../helpers/chainHelper'
import { sequenceTRDFromArray } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { triggerStream } from '../../../helpers/stateHelper'
import * as BNB from '../../binance/service'
import * as BTC from '../../bitcoin/context'
import { selectedPoolChain$ } from '../../midgard/common'
import { crossChainStakeMemo$ } from '../memo'
import { FeeLD, StakeFeesLD } from '../types'
import { reloadStakeFeesByChain } from './fees.helper'

// `TriggerStream` to reload stake fees
const { stream$: reloadStakeFees$, trigger: reloadStakeFees } = triggerStream()

// reload fees
Rx.combineLatest([selectedPoolChain$, reloadStakeFees$])
  .pipe(
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
  .subscribe()

const stakeFeeByChain$ = (chain: Chain): FeeLD => {
  switch (chain) {
    case 'BNB':
      return BNB.stakeFee$
    case 'BTC':
      // stake fees of BTC based on memo
      return FP.pipe(
        crossChainStakeMemo$,
        RxOp.switchMap((oMemo) =>
          FP.pipe(
            oMemo,
            O.fold(
              () => Rx.of(RD.initial),
              (memo) => BTC.stakeFee$(memo)
            )
          )
        )
      )
    case 'ETH':
      return Rx.of(RD.failure(new Error('Stake fee for ETH has not been implemented')))
    case 'THOR':
      return Rx.of(RD.failure(new Error('Stake fee for THOR has not been implemented')))
  }
}

const stakeFees$: StakeFeesLD = selectedPoolChain$.pipe(
  RxOp.switchMap((oPoolChain) =>
    FP.pipe(
      oPoolChain,
      O.map((chain) =>
        FP.pipe(
          Rx.combineLatest(
            isBaseChain(chain)
              ? // for deposits on base chain, fee for base chain is needed only
                [stakeFeeByChain$(BASE_CHAIN)]
              : // for x-chain deposits, we do need to load fees for base- AND x-chain,
                [stakeFeeByChain$(BASE_CHAIN), stakeFeeByChain$(chain)]
          ),
          RxOp.map(sequenceTRDFromArray),
          liveData.map(([base, cross]) => ({
            base,
            cross: O.fromNullable(cross)
          }))
        )
      ),
      O.getOrElse((): StakeFeesLD => Rx.of(RD.initial)),
      RxOp.shareReplay(1)
    )
  )
)
export { stakeFees$, reloadStakeFees }
