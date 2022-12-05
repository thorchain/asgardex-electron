import { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

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
  const { mimir$, reloadMimir, thorchainConstantsState$, reloadThorchainConstants } = useThorchainContext()

  const tnConstantsPoolCycle$: PoolCycleLD = useMemo(
    () =>
      FP.pipe(
        thorchainConstantsState$,
        liveData.map(({ int_64_values }) => Number(int_64_values?.PoolCycle)),
        liveData.chain((poolCycle) =>
          // validation -> value needs to be a number
          liveData.fromPredicate<Error, number>(
            () => !isNaN(poolCycle),
            () => Error(`Invalid value of constant 'PoolCycle' ${poolCycle} `)
          )(poolCycle)
        ),
        liveData.mapLeft(() => ({ errorId: ErrorId.GET_TC_CONSTANT, msg: 'Unable to get constant of PoolCycle' }))
      ),
    [thorchainConstantsState$]
  )

  const mimirPoolCycle$: PoolCycleLD = useMemo(
    () =>
      FP.pipe(
        mimir$,
        liveData.map(({ POOLCYCLE: poolCycle }) => O.fromNullable(poolCycle)),
        liveData.chain(liveData.fromOption(() => Error('Unable to load pool cycle from Mimir'))),
        liveData.mapLeft(({ message }) => ({ errorId: ErrorId.GET_TC_CONSTANT, msg: message }))
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
        Rx.combineLatest([tnConstantsPoolCycle$, mimirPoolCycle$]),
        RxOp.map(([tnPoolCycleRD, mimirPoolCycleRD]) =>
          FP.pipe(
            mimirPoolCycleRD,
            RD.alt(() => tnPoolCycleRD)
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
