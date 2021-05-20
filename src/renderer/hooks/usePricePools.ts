import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useMidgardContext } from '../contexts/MidgardContext'
import { liveData } from '../helpers/rx/liveData'
import { PricePools } from '../views/pools/Pools.types'

export type UsePricePoolsResult = ReturnType<typeof usePricePools>

export const usePricePools = () => {
  const {
    service: {
      pools: { poolsState$ }
    }
  } = useMidgardContext()

  const [pricePools] = useObservableState<O.Option<PricePools>>(
    () =>
      FP.pipe(
        poolsState$,
        liveData.map(({ pricePools }) => pricePools),
        RxOp.map(FP.flow(RD.toOption, O.flatten))
      ),
    O.none
  )

  return pricePools
}
