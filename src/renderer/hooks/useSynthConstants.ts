import { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as N from 'fp-ts/lib/number'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { useThorchainContext } from '../contexts/ThorchainContext'
import { eqError } from '../helpers/fp/eq'
import { LiveData, liveData } from '../helpers/rx/liveData'

const eqMaxSynthPerPoolDepthRD = RD.getEq<Error, number>(eqError, N.Eq)

type MaxSynthPerPoolDepthRD = RD.RemoteData<Error, number>
type MaxSynthPerPoolDepthLD = LiveData<Error, number>

export const useSynthConstants = (): {
  maxSynthPerPoolDepth: MaxSynthPerPoolDepthRD
  reloadConstants: FP.Lazy<void>
} => {
  const { mimir$, reloadMimir, thorchainConstantsState$, reloadThorchainConstants } = useThorchainContext()

  const tnMaxSynthPerPoolDepth$: MaxSynthPerPoolDepthLD = useMemo(
    () =>
      FP.pipe(
        thorchainConstantsState$,
        liveData.map(({ int_64_values }) => Number(int_64_values?.MaxSynthPerPoolDepth)),
        liveData.chain((value) =>
          // validation -> value needs to be a number
          liveData.fromPredicate<Error, number>(
            () => !isNaN(value),
            () => Error(`Invalid value of constant 'MaxSynthPerPoolDepth' ${value} `)
          )(value)
        )
      ),
    [thorchainConstantsState$]
  )

  const mimirMaxSynthPerPoolDepth$: MaxSynthPerPoolDepthLD = useMemo(
    () =>
      FP.pipe(
        mimir$,
        liveData.map(({ MAXSYNTHPERPOOLDEPTH: poolCycle }) => O.fromNullable(poolCycle)),
        liveData.chain(liveData.fromOption(() => Error(`Unable to get 'MAXSYNTHPERPOOLDEPTH' from Mimir`)))
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
        Rx.combineLatest([mimirMaxSynthPerPoolDepth$, tnMaxSynthPerPoolDepth$]),
        RxOp.map(([mimirMaxSynthPerPoolDepthRD, tnMaxSynthPerPoolDepthRD]) =>
          FP.pipe(
            mimirMaxSynthPerPoolDepthRD,
            RD.alt(() => tnMaxSynthPerPoolDepthRD)
          )
        ),
        RxOp.distinctUntilChanged(eqMaxSynthPerPoolDepthRD.equals)
      ),
    RD.initial
  )

  // Reload data on mount
  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { maxSynthPerPoolDepth: data, reloadConstants: getData }
}
