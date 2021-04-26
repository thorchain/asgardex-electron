import * as RD from '@devexperts/remote-data-ts'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useMidgardContext } from '../contexts/MidgardContext'
import { isBUSDAsset } from '../helpers/assetHelper'
import { liveData } from '../helpers/rx/liveData'
import { PricePool, PricePools } from '../views/pools/Pools.types'

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

  const usdPricePool: O.Option<PricePool> = FP.pipe(
    pricePools,
    O.chain(FP.flow(A.findFirst(({ asset }: PricePool) => isBUSDAsset(asset))))
  )

  return {
    pricePools,
    usdPricePool
  }
}
