import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import {
  poolsStorageIO,
  PoolsStorageEncoded,
  PoolsWatchList,
  PoolsWatchLists,
  poolsWatchListsIO
} from '../../../shared/api/io'
import { Network } from '../../../shared/api/types'
import { eqAsset } from '../../helpers/fp/eq'
import { observableState } from '../../helpers/stateHelper'
import { network$ } from '../app/service'

const DEFAULT_WATCH_LISTS = {
  testnet: [],
  stagenet: [],
  mainnet: []
}
const { get$: watchlists$, get: watchlists, set: setWatchlists } = observableState<PoolsWatchLists>(DEFAULT_WATCH_LISTS)

const updateStorage = (watchlists: PoolsWatchLists) => {
  // update file storage
  FP.pipe(watchlists, poolsWatchListsIO.encode, (encoded) => {
    return TE.tryCatch(
      () => window.apiPoolsStorage.save({ watchlists: encoded }),
      (reason) => Error(String(reason))
    )()
  })
}

const getStorage: T.Task<PoolsStorageEncoded> = () => window.apiPoolsStorage.get()

// Try to read stored data from file to put it into `ObservableState`
// At start and only once needed
getStorage().then((eResult) =>
  FP.pipe(
    eResult,
    poolsStorageIO.decode,
    E.map(({ watchlists }) => setWatchlists(watchlists))
  )
)

const watchlist$: Rx.Observable<PoolsWatchList> = FP.pipe(
  Rx.combineLatest([network$, watchlists$]),
  RxOp.map(([network, state]) => state[network]),
  RxOp.shareReplay(1)
)

const addToWatchlist = (poolAsset: Asset, network: Network) => {
  const current: PoolsWatchLists = watchlists()
  FP.pipe(
    current[network],
    // check if we already have pool asset in watchlist
    A.elem(eqAsset)(poolAsset),
    (exists) => {
      // avoid storing same data
      if (!exists) {
        // new data
        const updated: PoolsWatchLists = { ...current, [network]: [...current[network], poolAsset] }
        // update file storage
        updateStorage(updated)
        // update state
        setWatchlists(updated)
      }
    }
  )
}

const removeFromWatchlist = (poolAsset: Asset, network: Network) => {
  const current: PoolsWatchLists = watchlists()
  FP.pipe(
    current[network],
    // check if we already have pool asset in watchlist
    A.elem(eqAsset)(poolAsset),
    (exists) => {
      // avoid storing same data
      if (exists) {
        // new data
        const updated: PoolsWatchLists = {
          ...current,
          [network]: FP.pipe(
            current[network],
            A.filter((asset) => !eqAsset.equals(poolAsset, asset))
          )
        }
        // update file storage
        updateStorage(updated)
        // update state
        setWatchlists(updated)
      }
    }
  )
}

export { watchlist$, addToWatchlist, removeFromWatchlist }
