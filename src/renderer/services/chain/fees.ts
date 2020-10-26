import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { BASE_CHAIN } from '../../const'
import { isBaseChain } from '../../helpers/chainHelper'
import { sequenceTRDFromArray } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import * as BNB from '../binance/service'
import * as BTC from '../bitcoin/context'
import { selectedPoolAsset$, selectedPoolChain$ } from '../midgard/common'
import { crossChainStakeMemo$ } from './memo'
import { FeeLD, StakeFeesLD } from './types'

const reloadStakeFeesByChain = (chain: Chain) => {
  switch (chain) {
    case 'BNB':
      BNB.reloadFees()
      break
    case 'BTC':
      BTC.reloadStakeFee()
      break
    case 'ETH':
      // not available yet
      break
    case 'THOR':
      // not available yet
      break
    default:
  }
}

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
      return crossChainStakeMemo$.pipe(
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

const stakeFees$: StakeFeesLD = selectedPoolAsset$.pipe(
  RxOp.switchMap((oPoolAsset) =>
    FP.pipe(
      oPoolAsset,
      O.map((poolAsset) =>
        FP.pipe(
          Rx.combineLatest(
            isBaseChain(poolAsset.chain)
              ? // for deposits on base chain, fee for base chain is needed only
                [stakeFeeByChain$(BASE_CHAIN)]
              : // for x-chain deposits, we do need to load fees for base- AND x-chain,
                [stakeFeeByChain$(BASE_CHAIN), stakeFeeByChain$(poolAsset.chain)]
          ),
          RxOp.map(sequenceTRDFromArray),
          liveData.map(([base, cross]) => ({
            base,
            cross: O.fromNullable(cross)
          }))
        )
      ),
      O.getOrElse((): StakeFeesLD => Rx.of(RD.initial))
    )
  )
)

export { stakeFees$, reloadStakeFees }
