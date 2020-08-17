import * as RD from '@devexperts/remote-data-ts'
import byzantine from '@thorchain/byzantine-module'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { some } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import * as Rx from 'rxjs'
import { combineLatest } from 'rxjs'
import {
  retry,
  catchError,
  concatMap,
  map,
  shareReplay,
  startWith,
  switchMap,
  distinctUntilChanged,
  delay,
  tap
} from 'rxjs/operators'

import { PRICE_POOLS_WHITELIST } from '../../const'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { Configuration, DefaultApi } from '../../types/generated/midgard'
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

/**
 * Endpoint provided by Byzantine
 */
const byzantine$ = getNetworkState$.pipe(
  // Since `getNetworkState` is created by `observableState` and it takes an initial value,
  // this stream might emit same values and we do need a "dirty check"
  // to avoid to create another instance of byzantine by having same `Network`
  distinctUntilChanged(),
  switchMap((network) => Rx.from(byzantine(network === Network.MAIN, true))),
  shareReplay(),
  retry(BYZANTINE_MAX_RETRY)
)

/**
 * Loading queue to get all needed data for `PoolsState`
 */
const loadPoolsStateData$ = (): Rx.Observable<PoolsStateRD> => {
  const poolAssets$ = pipe(apiGetPools$, shareReplay(1))

  const assetDetails$ = pipe(
    poolAssets$,
    switchMap((assets) => apiGetAssetInfo$(assets.join(',')))
  )

  const poolDetails$ = pipe(
    poolAssets$,
    switchMap((assets) => apiGetPoolsData$(assets.join(',')))
  )

  const pricePools$ = pipe(
    poolDetails$,
    map((poolDetails) => some(getPricePools(poolDetails, PRICE_POOLS_WHITELIST)))
  )

  return pipe(
    combineLatest([poolAssets$, assetDetails$, poolDetails$, pricePools$]),
    map(([poolAssets, assetDetails, poolDetails, pricePools]) => ({
      poolAssets,
      assetDetails,
      poolDetails,
      pricePools
    })),
    tap((state) => {
      const prevAsset = selectedPricePoolAsset()
      const pricePools = O.toNullable(state.pricePools)
      if (pricePools) {
        const selectedPricePool = pricePoolSelector(pricePools, prevAsset)
        setSelectedPricePoolAsset(selectedPricePool.asset)
      }
    }),
    map(RD.success),
    startWith(RD.pending),
    catchError((error: Error) => Rx.of(RD.failure(error))),
    retry(MIDGARD_MAX_RETRY)
  )
}

/**
 * Get data of `Pools` from Midgard
 */
const apiGetPools$ = byzantine$.pipe(
  concatMap((endpoint) => {
    const api = getMidgardDefaultApi(endpoint)
    return api.getPools()
  })
)

/**
 * Get data of `AssetDetails` from Midgard
 * `delayTime` - Optional value in `ms` to delay request
 */
const apiGetAssetInfo$ = (asset: string, delayTime = 0) =>
  Rx.of(null).pipe(
    delay(delayTime),
    switchMap(() => byzantine$),
    switchMap((endpoint) => {
      const api = getMidgardDefaultApi(endpoint)
      return api.getAssetInfo({ asset })
    })
  )

/**
 * Get `PoolDetails` data from Midgard
 * `delayTime` - Optional value in `ms` to delay request
 */
const apiGetPoolsData$ = (asset: string, delayTime = 0) =>
  Rx.of(null).pipe(
    delay(delayTime),
    switchMap(() => byzantine$),
    switchMap((endpoint) => {
      const api = getMidgardDefaultApi(endpoint)
      return api.getPoolsData({ asset })
    })
  )

// `TriggerStream` to reload data of pools
const { stream$: reloadPoolsState$, trigger: reloadPoolsState } = triggerStream()

/**
 * State of all pool data
 */
const poolsState$: Rx.Observable<PoolsStateRD> = reloadPoolsState$.pipe(
  // start loading queue
  switchMap((_) => loadPoolsStateData$().pipe(startWith(RD.pending))),
  // cache it to avoid reloading data by every subscription
  shareReplay()
)

/**
 * Get `ThorchainLastblock` data from Midgard
 */
const apiGetThorchainLastblock$ = byzantine$.pipe(
  concatMap((endpoint) => {
    const api = getMidgardDefaultApi(endpoint)
    return api.getThorchainProxiedLastblock()
  })
)

// `TriggerStream` to reload data of `ThorchainLastblock`
const { stream$: reloadThorchainLastblock$, trigger: reloadThorchainLastblock } = triggerStream()

/**
 * Loads data of `ThorchainLastblock`
 */
const loadThorchainLastblock$ = () =>
  apiGetThorchainLastblock$.pipe(
    // store result
    concatMap((result) => Rx.of(RD.success(result))),
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
  shareReplay()
)

/**
 * Get `ThorchainConstants` data from Midgard
 */
const apiGetThorchainConstants$ = byzantine$.pipe(
  concatMap((endpoint) => {
    const api = getMidgardDefaultApi(endpoint)
    return api.getThorchainProxiedConstants()
  })
)

/**
 * Provides data of `ThorchainConstants`
 */
const thorchainConstantsState$: Rx.Observable<ThorchainConstantsRD> = apiGetThorchainConstants$.pipe(
  concatMap((result) => Rx.of(RD.success(result))),
  catchError((error: Error) => Rx.of(RD.failure(error))),
  startWith(RD.pending),
  retry(MIDGARD_MAX_RETRY),
  shareReplay()
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
 * API request to get data of `NetworkInfo`
 */
const apiGetNetworkData$ = byzantine$.pipe(
  concatMap((endpoint) => {
    const api = getMidgardDefaultApi(endpoint)
    return api.getNetworkData()
  })
)

/**
 * Loads data of `NetworkInfo`
 */
const loadNetworkInfo$ = (): Rx.Observable<NetworkInfoRD> =>
  apiGetNetworkData$.pipe(
    // store result
    concatMap((info) => Rx.of(RD.success(info))),
    // catch any errors if there any
    catchError((error: Error) => Rx.of(RD.failure(error))),
    startWith(RD.pending),
    retry(MIDGARD_MAX_RETRY)
  )

// `TriggerStream` to reload `NetworkInfo`
const { stream$: reloadNetworkInfo$, trigger: reloadNetworkInfo } = triggerStream()

/**
 * State of `NetworkInfo`, it will be loaded data by first subscription only
 */
const networkInfo$: Rx.Observable<NetworkInfoRD> = reloadNetworkInfo$.pipe(
  // start request
  switchMap((_) => loadNetworkInfo$()),
  // cache it to avoid reloading data by every subscription
  shareReplay()
)

const apiEndpoint$: Rx.Observable<E.Either<Error, string>> = byzantine$.pipe(
  map((endpoint) => E.right(endpoint)),
  catchError((error: Error) => Rx.of(E.left(error)))
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
  apiEndpoint$
}
