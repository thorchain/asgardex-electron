import * as RD from '@devexperts/remote-data-ts'
import { baseAmount, BaseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useMidgardContext } from '../contexts/MidgardContext'
import { THORCHAIN_DECIMAL } from '../helpers/assetHelper'
import { liveData } from '../helpers/rx/liveData'

export type Limit = {
  reached: boolean
  totalActiveBondAmount: BaseAmount
  totalPooledRuneAmount: BaseAmount
}

export type LimitRD = RD.RemoteData<Error, Limit>

export const getLimit = (totalPooledRune: string, totalActiveBond: string): Limit => {
  const totalActiveBondAmount = baseAmount(totalActiveBond, THORCHAIN_DECIMAL)
  const totalPooledRuneAmount = baseAmount(totalPooledRune, THORCHAIN_DECIMAL)
  const reached = totalPooledRuneAmount.gte(totalActiveBondAmount)

  return {
    reached,
    totalActiveBondAmount,
    totalPooledRuneAmount
  }
}

export const useProtocolLimit = (): { data: LimitRD; reload: FP.Lazy<void> } => {
  const {
    service: { networkInfo$, reloadNetworkInfo }
  } = useMidgardContext()

  const [data] = useObservableState<LimitRD>(
    () =>
      FP.pipe(
        networkInfo$,
        liveData.map(({ totalPooledRune, bondMetrics: { totalActiveBond } }) =>
          getLimit(totalPooledRune, totalActiveBond)
        ),
        RxOp.shareReplay(1)
      ),
    RD.initial
  )

  return { data, reload: reloadNetworkInfo }
}
