import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { BASE_CHAIN } from '../../const'
import { eqChain } from '../../helpers/fp/eq'
import { sequenceTRDFromArray } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import * as BNB from '../binance/service'
import * as BTC from '../bitcoin/context'
import { selectedPoolAsset$, selectedPoolChain$ } from '../midgard/common'
import { FeeLD, StakeFeesLD } from './types'

const reloadFeesByChain = (chain: Chain) => {
  switch (chain) {
    case 'BNB':
      BNB.reloadFees()
      break
    case 'BTC':
      BTC.reloadFees()
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

// `TriggerStream` to reload fees
const { stream$: reloadFees$, trigger: reloadFees } = triggerStream()

// reload fees
Rx.combineLatest([selectedPoolChain$, reloadFees$])
  .pipe(
    RxOp.tap(([oChain, _]) =>
      FP.pipe(
        oChain,
        O.map((chain) => {
          reloadFeesByChain(chain)
          // reload base-chain if it's different to selected pool-chain (needed for fees to transfer RUNE assets on base chain)
          if (!eqChain.equals(chain, BASE_CHAIN)) reloadFeesByChain(BASE_CHAIN)
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
      return BTC.stakeFee$
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
            eqChain.equals(BASE_CHAIN, poolAsset.chain)
              ? [stakeFeeByChain$(BASE_CHAIN)]
              : [stakeFeeByChain$(BASE_CHAIN), stakeFeeByChain$(poolAsset.chain)]
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

export { stakeFees$, reloadFees }
