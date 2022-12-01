import { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import { useObservableState } from 'observable-hooks'

import { useThorchainContext } from '../contexts/ThorchainContext'
import { LiveData, liveData } from '../helpers/rx/liveData'

type MaxSynthPerPoolDepthRD = RD.RemoteData<Error, number>
type MaxSynthPerPoolDepthLD = LiveData<Error, number>

export const useSynthConstants = (): {
  maxSynthPerPoolDepth: MaxSynthPerPoolDepthRD
  reloadConstants: FP.Lazy<void>
} => {
  const { thorchainConstantsState$, reloadThorchainConstants } = useThorchainContext()

  const maxSynthPerPoolDepth$: MaxSynthPerPoolDepthLD = useMemo(
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

  const maxSynthPerPoolDepth = useObservableState(maxSynthPerPoolDepth$, RD.initial)

  // Reload data on mount
  useEffect(() => {
    reloadThorchainConstants()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { maxSynthPerPoolDepth, reloadConstants: reloadThorchainConstants }
}
