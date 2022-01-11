import { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { useMidgardContext } from '../contexts/MidgardContext'
import { useThorchainContext } from '../contexts/ThorchainContext'
import { eqApiError } from '../helpers/fp/eq'
import { LiveData, liveData } from '../helpers/rx/liveData'
import { ApiError, ErrorId } from '../services/wallet/types'

type PoolCycleRD = RD.RemoteData<ApiError, number>
type PoolCycleLD = LiveData<ApiError, number>

const eqPoolCycle = RD.getEq<ApiError, number>(eqApiError, N.Eq)

export const usePoolCycle = (): {
  poolCycle: PoolCycleRD
  reloadPoolCycle: FP.Lazy<void>
} => {
  const { mimir$, reloadMimir } = useThorchainContext()
  const {
    service: { thorchainConstantsState$, reloadThorchainConstants }
  } = useMidgardContext()

  const midgardConstantsPoolCycle$: PoolCycleLD = useMemo(
    () =>
      FP.pipe(
        thorchainConstantsState$,
        liveData.map(({ int_64_values }) => int_64_values.PoolCycle),
        liveData.mapLeft(() => ({ errorId: ErrorId.GET_POOL_CYCLE, msg: 'Unable to load pool cycle from Midgard' }))
      ),
    [thorchainConstantsState$]
  )

  const mimirPoolCycle$: PoolCycleLD = useMemo(
    () =>
      FP.pipe(
        mimir$,
        liveData.map(({ POOLCYCLE: poolCycle }) => O.fromNullable(poolCycle)),
        liveData.chain(liveData.fromOption(() => Error('Unable to load pool cycle from Mimir'))),
        liveData.mapLeft(({ message }) => ({ errorId: ErrorId.GET_POOL_CYCLE, msg: message }))
      ),
    [mimir$]
  )

  const getData = useCallback(() => {
    reloadMimir()
    reloadThorchainConstants()
  }, [reloadThorchainConstants, reloadMimir])

  const [data] = useObservableState(
    () =>
      FP.pipe(
        Rx.combineLatest([midgardConstantsPoolCycle$, mimirPoolCycle$]),
        RxOp.map(([mimirPoolCycleRD, midgardPoolCycleRD]) =>
          FP.pipe(
            mimirPoolCycleRD,
            RD.alt(() => midgardPoolCycleRD)
          )
        ),
        RxOp.distinctUntilChanged(eqPoolCycle.equals)
      ),
    RD.initial
  )

  // Reload data on mount
  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { poolCycle: data, reloadPoolCycle: getData }
}
