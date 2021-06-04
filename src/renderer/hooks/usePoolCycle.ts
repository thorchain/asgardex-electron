import { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { eqNumber } from 'fp-ts/Eq'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { useMidgardContext } from '../contexts/MidgardContext'
import { useThorchainContext } from '../contexts/ThorchainContext'
import { LiveData, liveData } from '../helpers/rx/liveData'
import { observableState } from '../helpers/stateHelper'

type Data = RD.RemoteData<Error, number>

const _eq = RD.getEq({ equals: () => true }, eqNumber)

export const usePoolCycle = (): [Data, FP.Lazy<void>] => {
  const { get$: poolCycleState$, set: setPoolCycleState } = useMemo(() => observableState<Data>(RD.initial), [])
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
    console.log('get form midgard')
    reloadThorchainConstants()
    return poolCycleFromMidgardConstants$
  }, [reloadThorchainConstants, poolCycleFromMidgardConstants$])

  const getPoolCycleFromMimir = useCallback(() => {
    console.log('get form mimir')
    reloadMimir()
    return mimir$
  }, [reloadMimir, mimir$])

  const getData = useCallback(() => {
    console.log('get pool cycle data')
    FP.pipe(
      getPoolCycleFromMimir(),
      liveData.map(({ 'mimir//POOLCYCLE': newPoolCycle }) => O.fromNullable(newPoolCycle)),
      RxOp.catchError(() => FP.pipe(getPoolCycleFromMidgard(), liveData.map(O.some))),
      liveData.chain(O.fold(getPoolCycleFromMidgard, (poolCycle) => liveData.of(poolCycle))),
      RxOp.catchError(() => Rx.of(RD.failure(Error('unable to load'))))
    ).subscribe(setPoolCycleState)
  }, [getPoolCycleFromMimir, setPoolCycleState, getPoolCycleFromMidgard])

  const [data] = useObservableState(
    () =>
      FP.pipe(
        poolCycleState$,
        RxOp.shareReplay(1)
        // RxOp.distinctUntilChanged((a, b) => eq.equals(a, b))
      ),
    RD.initial
  )

  useEffect(() => {
    getData()
    // eslint-disable-next-line
  }, [])

  console.log('data - ', data)
  return [data, getData]
}
