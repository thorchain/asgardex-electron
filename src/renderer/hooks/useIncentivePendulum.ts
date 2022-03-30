import * as RD from '@devexperts/remote-data-ts'
import { BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useMidgardContext } from '../contexts/MidgardContext'
import { THORCHAIN_DECIMAL } from '../helpers/assetHelper'
import { liveData } from '../helpers/rx/liveData'

export type Color = 'green' | 'yellow' | 'red' | 'grey'

export type IncentivePendulum = {
  totalActiveBondAmount: BaseAmount
  totalPooledRuneAmount: BaseAmount
  incentivePendulum: number // percent
  incentivePendulumLight: Color
}

export type IncentivePendulumRD = RD.RemoteData<Error, IncentivePendulum>

export const getIncentivePendulum = (totalPooledRune: string, totalActiveBond: string): IncentivePendulum => {
  const totalActiveBondAmount = baseAmount(totalActiveBond, THORCHAIN_DECIMAL)
  const totalPooledRuneAmount = baseAmount(totalPooledRune, THORCHAIN_DECIMAL)

  const incentivePendulumAmount = totalActiveBondAmount.gt(0)
    ? totalPooledRuneAmount.times(200).div(totalActiveBondAmount)
    : totalActiveBondAmount // zero
  const incentivePendulum = incentivePendulumAmount.amount().toNumber()

  let incentivePendulumLight: Color = 'grey'
  if (totalActiveBondAmount.lte(0)) incentivePendulumLight = 'red'
  else if (incentivePendulum < 150) incentivePendulumLight = 'green'
  else if (incentivePendulum < 190) incentivePendulumLight = 'yellow'
  else if (incentivePendulum > 190) incentivePendulumLight = 'red'

  return {
    incentivePendulum,
    incentivePendulumLight,
    totalActiveBondAmount,
    totalPooledRuneAmount
  }
}

export const useIncentivePendulum = (): { data: IncentivePendulumRD; reload: FP.Lazy<void> } => {
  const {
    service: { networkInfo$, reloadNetworkInfo }
  } = useMidgardContext()

  const [data] = useObservableState<IncentivePendulumRD>(
    () =>
      FP.pipe(
        networkInfo$,
        liveData.map(({ totalPooledRune, bondMetrics: { totalActiveBond } }) =>
          getIncentivePendulum(totalPooledRune, totalActiveBond)
        ),
        RxOp.shareReplay(1)
      ),
    RD.initial
  )

  return { data, reload: reloadNetworkInfo }
}
