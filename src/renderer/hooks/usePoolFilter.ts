import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useMidgardContext } from '../contexts/MidgardContext'
import { PoolFilter, PoolType } from '../services/midgard/types'

export const usePoolFilter = (poolType: PoolType) => {
  const {
    service: {
      pools: { poolsFilters$, setPoolsFilter }
    }
  } = useMidgardContext()

  const [filter] = useObservableState<O.Option<PoolFilter>>(
    () =>
      FP.pipe(
        poolsFilters$,
        RxOp.map((filters) => FP.pipe(O.fromNullable(filters[poolType]), O.flatten))
      ),
    O.none
  )

  const setFilter = (oFilter: O.Option<PoolFilter>) => setPoolsFilter(poolType, oFilter)

  return { setFilter, filter }
}
