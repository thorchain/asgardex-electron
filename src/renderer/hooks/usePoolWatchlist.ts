import { useCallback, useEffect } from 'react'

import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../shared/api/types'
import { useMidgardContext } from '../contexts/MidgardContext'
import { PoolWatchList } from '../services/midgard/types'
import { useNetwork } from './useNetwork'

export const usePoolWatchlist = () => {
  const {
    service: {
      pools: { poolsWatchlist$, addPoolToWatchlist, removePoolFromWatchlist }
    }
  } = useMidgardContext()

  const { network } = useNetwork()

  const [list, networkUpdated] = useObservableState<PoolWatchList, Network>(
    (network$) =>
      FP.pipe(
        Rx.combineLatest([poolsWatchlist$, network$.pipe(RxOp.distinctUntilChanged())]),
        RxOp.switchMap(([list, network]) => Rx.of(list[network]))
      ),
    []
  )

  // `networkUpdated` needs to be called whenever network has been updated
  // to update `useObservableState` properly to get `PoolWatchList` depending on selected `Network`
  useEffect(() => networkUpdated(network), [network, networkUpdated])

  const add = useCallback((poolAsset: Asset) => addPoolToWatchlist(poolAsset, network), [addPoolToWatchlist, network])

  const remove = useCallback(
    (poolAsset: Asset) => removePoolFromWatchlist(poolAsset, network),
    [network, removePoolFromWatchlist]
  )

  return { list, add, remove }
}
