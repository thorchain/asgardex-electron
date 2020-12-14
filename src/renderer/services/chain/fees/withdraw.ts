import * as RD from '@devexperts/remote-data-ts'
import { Chain, baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { liveData } from '../../../helpers/rx/liveData'
import { triggerStream } from '../../../helpers/stateHelper'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import { selectedPoolChain$ } from '../../midgard/common'
import * as THOR from '../../thorchain'
import { getWithdrawMemo$ } from '../memo'
import { FeeLD, WithdrawFeesLD } from '../types'

// `TriggerStream` to reload withdraw fees
const { stream$: reloadWithdrawFees$, trigger: reloadWithdrawFees } = triggerStream()

const withdrawFeeByChain$ = (chain: Chain): FeeLD => {
  switch (chain) {
    case 'BNB':
      return BNB.fees$.pipe(liveData.map(({ fast }) => fast))
    case 'BTC':
      // deposit fee for BTC txs based on withdraw memo
      return getWithdrawMemo$.pipe(
        RxOp.switchMap((oMemo) =>
          FP.pipe(
            oMemo,
            O.fold(
              () => Rx.of(RD.initial),
              (memo) => BTC.poolFee$(memo)
            )
          )
        )
      )
    case 'ETH':
      return Rx.of(RD.failure(new Error('Deposit fee for ETH has not been implemented')))
    case 'THOR':
      return THOR.fees$.pipe(liveData.map(({ fast }) => fast))
  }
}

const withdrawFees$: WithdrawFeesLD = Rx.combineLatest([selectedPoolChain$, reloadWithdrawFees$]).pipe(
  RxOp.switchMap(([oPoolChain, _]) =>
    FP.pipe(
      oPoolChain,
      O.map((chain) =>
        FP.pipe(
          liveData.sequenceT(withdrawFeeByChain$(chain), withdrawFeeByChain$('THOR')),
          liveData.map(([asset, thor]) => ({
            thorMemo: thor,
            thorOut: baseAmount(thor.amount().times(3)),
            assetOut: baseAmount(asset.amount().times(3))
          }))
        )
      ),
      O.getOrElse((): WithdrawFeesLD => Rx.of(RD.initial))
    )
  )
)

export { reloadWithdrawFees, withdrawFees$ }
