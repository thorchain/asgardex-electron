import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { BASE_CHAIN } from '../../const'
import { eqChain } from '../../helpers/fp/eq'
import { sequenceTOption, sequenceTRDFromArray } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import * as BNB from '../binance/service'
import * as BTC from '../bitcoin/context'
import { selectedPoolAsset$, selectedPoolChain$ } from '../midgard/common'
import { baseAddress$ } from './address'
import { FeeLD, StakeFeesLD } from './types'

const reloadFeesByChain = (chain: Chain) => {
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
          // reload base-chain - if it's different to selected pool-chain only
          // ^ needed for fees to transfer RUNE assets on base chain
          if (!eqChain.equals(chain, BASE_CHAIN)) reloadFeesByChain(BASE_CHAIN)
          return true
        })
      )
    )
  )
  .subscribe()

const stakeFeeByChain$ = (chain: Chain, address = ''): FeeLD => {
  switch (chain) {
    case 'BNB':
      return BNB.stakeFee$
    case 'BTC':
      return BTC.stakeFee$(address)
    case 'ETH':
      return Rx.of(RD.failure(new Error('Stake fee for ETH has not been implemented')))
    case 'THOR':
      return Rx.of(RD.failure(new Error('Stake fee for THOR has not been implemented')))
  }
}

const stakeFees$: StakeFeesLD = Rx.combineLatest([selectedPoolAsset$, baseAddress$]).pipe(
  RxOp.switchMap(([oPoolAsset, oBaseAddress]) =>
    FP.pipe(
      sequenceTOption(oPoolAsset, oBaseAddress),
      O.map(([poolAsset, baseAddress]) =>
        FP.pipe(
          Rx.combineLatest(
            eqChain.equals(BASE_CHAIN, poolAsset.chain)
              ? // for deposits on base chain only, we DONT need an address
                [stakeFeeByChain$(BASE_CHAIN)]
              : // for x-chain deposits, base address might be used to calculate fees (currently for BTC fees only)
                [stakeFeeByChain$(BASE_CHAIN), stakeFeeByChain$(poolAsset.chain, baseAddress)]
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
