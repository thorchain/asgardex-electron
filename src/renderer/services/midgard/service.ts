import * as RD from '@devexperts/remote-data-ts'
import byzantine from '@thorchain/byzantine-module'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { some } from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
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
import { Configuration, DefaultApi, AssetDetail } from '../../types/generated/midgard'
import { PricePoolAsset } from '../../views/pools/types'
import { Network } from '../app/types'
import {
  PoolsStateRD,
  PoolsState,
  PoolDetails,
  NetworkInfoRD,
  ThorchainLastblockRD,
  ThorchainConstantsRD,
  SelectedPricePoolAsset
} from './types'
import { getPricePools, pricePoolSelector, filterPoolAssets } from './utils'

const MIDGARD_MAX_RETRY = 3
// const BYZANTINE_MAX_RETRY = 5

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
const byzantine$: Rx.Observable<E.Either<Error, string>> = getNetworkState$.pipe(
  distinctUntilChanged(),
  tap((network) => console.log('network:', network)),
  // Since `getNetworkState` is created by `observableState` and it takes an initial value,
  // this stream might emit same values and we do need a "dirty check"
  // to avoid to create another instance of byzantine by having same `Network`
  // distinctUntilChanged(),
  switchMap((network) => Rx.from(byzantine(network === Network.MAIN, true))),
  map((endpoint) => E.right(endpoint)),
  tap((endpoint) => console.log('byzantine :', endpoint)),
  shareReplay(),
  catchError((error) => Rx.of(E.left(error)))
  // retry(BYZANTINE_MAX_RETRY),
  // retryWhen((errors) => {
  //   return errors.pipe(
  //     delayWhen(() => Rx.timer(2000)),
  //     tap(() => console.log('retrying...'))
  //   )
  // })
  // retry()
  // retryWhen(() => getNetworkState$) // --> using `retryWhen()` instead of `retry()`
)

const initialPoolsState: PoolsState = {
  assetDetails: [],
  poolAssets: [],
  poolDetails: [],
  pricePools: O.none
}
/**
 * Loading queue to get all needed data for `PoolsState`
 */
const loadPoolsStateData$ = (): Rx.Observable<PoolsStateRD> => {
  // Local (mutable) state object to store all results of different api request we made here
  let state = { ...initialPoolsState }
  // start queue of requests to get all pool data
  return apiGetPools$.pipe(
    tap((ePoolAssets) => console.log('ePoolAssets:', ePoolAssets)),
    switchMap((ePoolAssets) =>
      FP.pipe(
        ePoolAssets,
        E.fold(
          (_error) => Rx.EMPTY,
          (poolAssets) => {
            // Store pool assets and filter out mini token
            // TODO(Veado): It can be removed as soon as midgard's endpoint has been fixed - see https://gitlab.com/thorchain/midgard/-/issues/215
            state = { ...state, poolAssets: filterPoolAssets(poolAssets) /* .slice(0, 2) */ }
            // Load `AssetDetails`
            // As long as Midgard has some issues to load all details at once at `v1/assets` endpoint we load details in sequence with some delay between
            // TODO(@Veado) Load details at once if Midgard has been fixed
            // switchMap((_) => apiGetAssetInfo$(state.poolAssets)),
            return Rx.combineLatest(...state.poolAssets.map((asset, index) => apiGetAssetInfo$(asset, index * 50)))
          }
        )
      )
    ),
    switchMap((assetDetails) => {
      // Store `AssetDetails` in `PoolsState`
      state = { ...state, assetDetails }
      // Load `PoolDetails`
      // As long as Midgard has some issues to load all details at once at `v1/detail` endpoint we load details in sequence with some delay between
      // TODO(@Veado) Load details at once if Midgard has been fixed
      // switchMap((_) => apiGetPoolsData$(state.poolAssets)),
      return Rx.combineLatest(...state.poolAssets.map((asset, index) => apiGetPoolsData$(asset, index * 50)))
    }),
    switchMap((poolDetails: PoolDetails) => {
      // Store `poolDetails` + `pricePools`
      state = {
        ...state,
        poolDetails,
        pricePools: some(getPricePools(poolDetails, PRICE_POOLS_WHITELIST))
      }
      // Update selected `PricePoolAsset`
      // check storage
      const prevAsset = selectedPricePoolAsset()
      const pricePools = O.toNullable(state.pricePools)
      if (pricePools) {
        const selectedPricePool = pricePoolSelector(pricePools, prevAsset)
        setSelectedPricePoolAsset(selectedPricePool.asset)
      }
      // Return all data in a `success` state
      return Rx.of(RD.success(state))
    }),
    // catch any errors if there any
    catchError((error: Error) => Rx.of(RD.failure(error))),
    retry(MIDGARD_MAX_RETRY)
  )
}

const callGetPools$ = (endpoint: string): Rx.Observable<E.Either<Error, string[]>> => {
  const api = getMidgardDefaultApi(endpoint)
  return api.getPools().pipe(
    map((result) => E.right(result)),
    catchError((error) => Rx.of(E.left(error)))
  )
}

/**
 * Get data of `Pools` from Midgard
 */
const apiGetPools$: Rx.Observable<E.Either<Error, string[]>> = byzantine$.pipe(
  switchMap((endpoint) =>
    FP.pipe(
      endpoint,
      E.fold((error) => Rx.of(E.left(error)), callGetPools$)
    )
  )
)

const callGetAssetInfo$ = (endpoint: string, asset: string): Rx.Observable<E.Either<Error, AssetDetail>> => {
  const api = getMidgardDefaultApi(endpoint)
  return api.getAssetInfo({ asset }).pipe(
    map((details) => E.right(details[0])),
    catchError((error) => Rx.of(E.left(error)))
  )
}

/**
 * Get data of `AssetDetails` from Midgard
 * `delayTime` - Optional value in `ms` to delay request
 */
const apiGetAssetInfo$ = (asset: string, delayTime = 0): Rx.Observable<E.Either<Error, AssetDetail>> =>
  Rx.of(null).pipe(
    delay(delayTime),
    switchMap(() => byzantine$),
    switchMap((eEndpoint) =>
      FP.pipe(
        eEndpoint,
        E.fold(
          (error) => Rx.of(E.left(error)),
          (endpoint) => callGetAssetInfo$(endpoint, asset)
        )
      )
    )
  )

/**
 * Get `PoolDetails` data from Midgard
 * `delayTime` - Optional value in `ms` to delay request
 */
const apiGetPoolsData$ = (asset: string, delayTime = 0) =>
  Rx.of(null).pipe(
    delay(delayTime),
    switchMap(() => byzantine$),
    switchMap((eEndpoint) => {
      return FP.pipe(
        eEndpoint,
        E.fold(Rx.throwError, (endpoint) => {
          const api = getMidgardDefaultApi(endpoint)
          return api.getPoolsData({ asset })
        })
      )
    }),
    map((details) => details[0])
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
  switchMap((eEndpoint) => {
    return FP.pipe(
      eEndpoint,
      E.fold(Rx.throwError, (endpoint) => {
        const api = getMidgardDefaultApi(endpoint)
        return api.getThorchainProxiedLastblock()
      })
    )
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
  switchMap((eEndpoint) => {
    return FP.pipe(
      eEndpoint,
      E.fold(Rx.throwError, (endpoint) => {
        const api = getMidgardDefaultApi(endpoint)
        return api.getThorchainProxiedConstants()
      })
    )
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

export const getSelectedPricePool = () => O.fromNullable(localStorage.getItem(PRICE_POOL_KEY) as PricePoolAsset)

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
  switchMap((eEndpoint) => {
    return FP.pipe(
      eEndpoint,
      E.fold(Rx.throwError, (endpoint) => {
        const api = getMidgardDefaultApi(endpoint)
        return api.getNetworkData()
      })
    )
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
