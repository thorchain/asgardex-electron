import { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useThorchainContext } from '../contexts/ThorchainContext'
import { liveData } from '../helpers/rx/liveData'
import { DEFAULT_MIMIR_HALT } from '../services/thorchain/const'
import { Mimir, MimirHaltRD, MimirHalt } from '../services/thorchain/types'

/**
 * Hook to get halt status defined by `Mimir`
 *
 * Note: Same rule as we have for services - Use this hook in top level *views only (but in child components)
 */
export const useMimirHalt = (): { mimirHaltRD: MimirHaltRD; mimirHalt: MimirHalt } => {
  const { mimir$ } = useThorchainContext()

  const [mimirHaltRD] = useObservableState<MimirHaltRD>(
    () =>
      FP.pipe(
        mimir$,
        liveData.map<Mimir, MimirHalt>((mimir) => ({
          haltTrading: mimir['mimir//HALTTRADING'] === 1,
          haltThorChain: mimir['mimir//HALTTHORCHAIN'] === 1,
          haltEthChain: mimir['mimir//HALTETHCHAIN'] === 1,
          haltEthTrading: mimir['mimir//HALTETHTRADING'] === 1
        })),
        RxOp.shareReplay(1)
      ),
    RD.initial
  )

  const mimirHalt = useMemo(
    () =>
      FP.pipe(
        mimirHaltRD,
        RD.toOption,
        O.getOrElse<MimirHalt>(() => DEFAULT_MIMIR_HALT)
      ),
    [mimirHaltRD]
  )

  return { mimirHaltRD, mimirHalt }
}
