import { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useMidgardContext } from '../contexts/MidgardContext'
import { useThorchainContext } from '../contexts/ThorchainContext'
import { eqApiError } from '../helpers/fp/eq'
import { LiveData, liveData } from '../helpers/rx/liveData'
import { observableState } from '../helpers/stateHelper'
import { ApiError, ErrorId } from '../services/wallet/types'

type PoolCycleRD = RD.RemoteData<ApiError, number>

const eqPoolCycle = RD.getEq<ApiError, number>(eqApiError, N.Eq)

export const usePoolCycle = (): [PoolCycleRD, FP.Lazy<void>] => {
  const { get$: poolCycleState$, set: setPoolCycleState } = useMemo(() => observableState<PoolCycleRD>(RD.initial), [])
  const { mimir$, reloadMimir } = useThorchainContext()
  const {
    service: { thorchainConstantsState$, reloadThorchainConstants }
  } = useMidgardContext()

  const poolCycleFromMidgardConstants$: LiveData<Error, number> = useMemo(
    () =>
      FP.pipe(
        thorchainConstantsState$,
        liveData.map(({ int_64_values }) => int_64_values.PoolCycle)
      ),
    [thorchainConstantsState$]
  )

  const getPoolCycleFromMidgard = useCallback(() => {
    reloadThorchainConstants()
    return poolCycleFromMidgardConstants$
  }, [reloadThorchainConstants, poolCycleFromMidgardConstants$])

  const getPoolCycleFromMimir = useCallback(() => {
    reloadMimir()
    return mimir$
  }, [reloadMimir, mimir$])

  const getData = useCallback(() => {
    FP.pipe(
      getPoolCycleFromMimir(),
      liveData.map(({ 'mimir//POOLCYCLE': newPoolCycle }) => O.fromNullable(newPoolCycle)),
      liveData.chainOnError(() => FP.pipe(getPoolCycleFromMidgard(), liveData.map(O.some))),
      liveData.chain(O.fold(getPoolCycleFromMidgard, (poolCycle) => liveData.of(poolCycle))),
      liveData.mapLeft(() => ({
        errorId: ErrorId.GET_MIMIR,
        msg: 'Unable to load pool cylce'
      }))
    ).subscribe(setPoolCycleState)
  }, [getPoolCycleFromMimir, setPoolCycleState, getPoolCycleFromMidgard])

  const [data] = useObservableState(
    () => FP.pipe(poolCycleState$, RxOp.shareReplay(1), RxOp.distinctUntilChanged(eqPoolCycle.equals)),
    RD.initial
  )

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [data, getData]
}
