import * as RD from '@devexperts/remote-data-ts'
import byzantine from '@thorchain/byzantine-module'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { some } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import * as Rx from 'rxjs'
import { combineLatest } from 'rxjs'
import { retry, catchError, map, shareReplay, startWith, switchMap, distinctUntilChanged } from 'rxjs/operators'

import { PRICE_POOLS_WHITELIST } from '../../const'
import { fromPromise$ } from '../../helpers/rx/fromPromise'
import { liveData, LiveData } from '../../helpers/rx/liveData'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { Configuration, DefaultApi, GetPoolsDetailsViewEnum } from '../../types/generated/midgard'
import { PricePoolAsset } from '../../views/pools/types'
import { isPricePoolAsset } from '../../views/pools/types'
import { Network } from '../app/types'
import {
  PoolsStateRD,
  NetworkInfoRD,
  ThorchainLastblockRD,
  ThorchainConstantsRD,
  SelectedPricePoolAsset
} from './types'
import { getPricePools, pricePoolSelector } from './utils'

const MIDGARD_MAX_RETRY = 3
const BYZANTINE_MAX_RETRY = 5

/**
 * Observable state of `Network`
 */
const { get$: getNetworkState$, set: setNetworkState } = observableState<Network>(Network.TEST)

/**
 * Helper to get `DefaultApi` instance for Midgard using custom basePath
 */
const getMidgardDefaultApi = (basePath: string) => new DefaultApi(new Configuration({ basePath }))

const nextByzantine$: (n: Network) => LiveData<Error, string> = fromPromise$<RD.RemoteData<Error, string>, Network>(
  (network: Network) => byzantine(network === Network.MAIN, true).then(RD.success),
  RD.pending,
  RD.failure
)

/**
 * Endpoint provided by Byzantine
 */
const byzantine$ = getNetworkState$.pipe(
  // Since `getNetworkState` is created by `observableState` and it takes an initial value,
  // this stream might emit same values and we do need a "dirty check"
  // to avoid to create another instance of byzantine by having same `Network`
  distinctUntilChanged(),
  switchMap(nextByzantine$),
  shareReplay(1),
  retry(BYZANTINE_MAX_RETRY)
)

/**
 * Get data of `Pools` from Midgard
 */
const apiGetPools$ = byzantine$.pipe(
  map(RD.map(getMidgardDefaultApi)),
  liveData.chain((api) =>
    pipe(
      api.getPools(),
      map(RD.success),
      catchError((e: Error) => Rx.of(RD.failure(e)))
    )
  )
)

/**
 * Loading queue to get all needed data for `PoolsState`
 */
const loadPoolsStateData$ = (): Rx.Observable<PoolsStateRD> => {
  const poolAssets$ = pipe(apiGetPools$, shareReplay(1))

  const assetDetails$ = pipe(
    poolAssets$,
    liveData.map((assets) => assets.join(',')),
    liveData.chain(apiGetAssetInfo$),
    shareReplay(1)
  )

  const poolDetails$ = pipe(
    poolAssets$,
    liveData.map((assets) => assets.join(',')),
    liveData.chain(apiGetPoolsData$),
    shareReplay(1)
  )

  const pricePools$ = pipe(
    poolDetails$,
    liveData.map((poolDetails) => some(getPricePools(poolDetails, PRICE_POOLS_WHITELIST))),
    shareReplay(1)
  )

  return pipe(
    combineLatest([poolAssets$, assetDetails$, poolDetails$, pricePools$]),
    map((state) => RD.combine(...state)),
    map(
      RD.map(([poolAssets, assetDetails, poolDetails, pricePools]) => {
        const prevAsset = selectedPricePoolAsset()
        const nullablePricePools = O.toNullable(pricePools)
        if (nullablePricePools) {
          const selectedPricePool = pricePoolSelector(nullablePricePools, prevAsset)
          setSelectedPricePoolAsset(selectedPricePool.asset)
        }
        return {
          poolAssets,
          assetDetails,
          poolDetails,
          pricePools
        }
      })
    ),
    startWith(RD.pending),
    catchError((error: Error) => Rx.of(RD.failure(error))),
    retry(MIDGARD_MAX_RETRY)
  )
}

/**
 * Get data of `AssetDetails` from Midgard
 */
const apiGetAssetInfo$ = (asset: string) =>
  pipe(
    byzantine$,
    liveData.chain((endpoint) =>
      pipe(
        getMidgardDefaultApi(endpoint).getAssetInfo({ asset }),
        map(RD.success),
        catchError((e: Error) => Rx.of(RD.failure(e)))
      )
    )
  )

/**
 * Get `PoolDetails` data from Midgard
 */
const apiGetPoolsData$ = (asset: string) =>
  byzantine$.pipe(
    liveData.chain((endpoint) =>
      pipe(
        getMidgardDefaultApi(endpoint).getPoolsDetails({ asset, view: GetPoolsDetailsViewEnum.Simple }),
        map(RD.success),
        catchError((e: Error) => Rx.of(RD.failure(e)))
      )
    )
  )

// `TriggerStream` to reload data of pools
const { stream$: reloadPoolsState$, trigger: reloadPoolsState } = triggerStream()

/**
 * State of all pool data
 */
const poolsState$: Rx.Observable<PoolsStateRD> = reloadPoolsState$.pipe(
  // start loading queue
  switchMap(loadPoolsStateData$),
  // cache it to avoid reloading data by every subscription
  shareReplay(1)
)

/**
 * Get `ThorchainLastblock` data from Midgard
 */
const apiGetThorchainLastblock$ = byzantine$.pipe(
  liveData.chain((endpoint) =>
    pipe(
      getMidgardDefaultApi(endpoint).getThorchainProxiedLastblock(),
      map(RD.success),
      catchError((e: Error) => Rx.of(RD.failure(e)))
    )
  )
)

// `TriggerStream` to reload data of `ThorchainLastblock`
const { stream$: reloadThorchainLastblock$, trigger: reloadThorchainLastblock } = triggerStream()

/**
 * Loads data of `ThorchainLastblock`
 */
const loadThorchainLastblock$ = () =>
  apiGetThorchainLastblock$.pipe(
    // catch any errors if there any
    catchError((error: Error) => Rx.of(RD.failure(error))),
    startWith(RD.pending),
    retry(MIDGARD_MAX_RETRY)
  )

/**
 * State of `ThorchainLastblock`, it will be loaded data by first subscription only
 */
const thorchainLastblockState$: Rx.Observable<ThorchainLastblockRD> = reloadThorchainLastblock$.pipe(
  // start request
  switchMap((_) => loadThorchainLastblock$()),
  // cache it to avoid reloading data by every subscription
  shareReplay(1)
)

/**
 * Get `ThorchainConstants` data from Midgard
 */
const apiGetThorchainConstants$ = pipe(
  byzantine$,
  liveData.chain((endpoint) =>
    pipe(
      getMidgardDefaultApi(endpoint).getThorchainProxiedConstants(),
      map(RD.success),
      catchError((e: Error) => Rx.of(RD.failure(e)))
    )
  )
)

/**
 * Provides data of `ThorchainConstants`
 */
const thorchainConstantsState$: Rx.Observable<ThorchainConstantsRD> = apiGetThorchainConstants$.pipe(
  startWith(RD.pending),
  retry(MIDGARD_MAX_RETRY),
  shareReplay(1)
)

const PRICE_POOL_KEY = 'asgdx-price-pool'

export const getSelectedPricePool = () =>
  FP.pipe(localStorage.getItem(PRICE_POOL_KEY), O.fromNullable, O.filter(isPricePoolAsset))

const {
  get$: selectedPricePoolAsset$,
  get: selectedPricePoolAsset,
  set: updateSelectedPricePoolAsset
} = observableState<SelectedPricePoolAsset>(getSelectedPricePool())

/**
 * Update selected `PricePoolAsset`
 */
const setSelectedPricePoolAsset = (asset: PricePoolAsset) => {
  localStorage.setItem(PRICE_POOL_KEY, asset)
  updateSelectedPricePoolAsset(some(asset))
}

/**
 * Loads data of `NetworkInfo`
 */
const loadNetworkInfo$ = (): Rx.Observable<NetworkInfoRD> =>
  pipe(
    byzantine$,
    liveData.chain((endpoint) =>
      pipe(
        getMidgardDefaultApi(endpoint).getNetworkData(),
        map(RD.success),
        startWith(RD.pending),
        catchError((e: Error) => Rx.of(RD.failure(e))),
        retry(MIDGARD_MAX_RETRY)
      )
    )
  )

// `TriggerStream` to reload `NetworkInfo`
const { stream$: reloadNetworkInfo$, trigger: reloadNetworkInfo } = triggerStream()

/**
 * State of `NetworkInfo`, it will be loaded data by first subscription only
 */
const networkInfo$: Rx.Observable<NetworkInfoRD> = reloadNetworkInfo$.pipe(
  // start request
  switchMap(loadNetworkInfo$),
  // cache it to avoid reloading data by every subscription
  shareReplay(1)
)

/**
 * Service object with all "public" functions and observables we want to provide
 */
export const service = {
  setNetworkState,
  poolsState$,
  reloadPoolsState,
  networkInfo$,
  reloadNetworkInfo,
  thorchainConstantsState$,
  thorchainLastblockState$,
  reloadThorchainLastblock,
  setSelectedPricePool: setSelectedPricePoolAsset,
  selectedPricePoolAsset$,
  apiEndpoint$: byzantine$
}
