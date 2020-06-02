import * as RD from '@devexperts/remote-data-ts'
import byzantine from '@thorchain/byzantine-module'
import * as Rx from 'rxjs'
import { retry, catchError, shareReplay, concatMap, tap, map, exhaustMap, mergeMap } from 'rxjs/operators'

import { BASE_TOKEN_TICKER } from '../../const'
import { Configuration, DefaultApi } from '../../types/generated/midgard'
import { PoolsStateRD, PoolsState, PoolDetails } from './types'
import { getAssetDetailIndex, getPriceIndex, toPoolDetailsMap } from './utils'

export const MIDGARD_MAX_RETRY = 3
export const BYZANTINE_MAX_RETRY = 5

/**
 * Helper to get `DefaultApi` instance for Midgard using custom basePath
 */
const getMidgardDefaultApi = (basePath: string) => new DefaultApi(new Configuration({ basePath }))

/**
 * Endpoint provided by Byzantine
 */
const byzantine$ = Rx.from(byzantine()).pipe(retry(BYZANTINE_MAX_RETRY))

/**
 * Same as `byzantine$`, but as a cached value
 */
const byzantineShared$ = byzantine$.pipe(shareReplay())

/**
 * Subject to provide state of pools data
 */
const poolsState$$ = new Rx.BehaviorSubject<PoolsStateRD>(RD.initial)

/**
 * Loading queue to get all needed data for `PoolsState`
 */
const getPoolsState$ = () => {
  let state: PoolsState
  let endpoint: string
  // start queue of requests to get all pool data
  return byzantineShared$.pipe(
    // set endpoint to make it available in other observables in this "pipe"
    map((ep: string) => (endpoint = ep)),
    // Update `PoolState` to `pending`
    tap((_) => poolsState$$.next(RD.pending)),
    // load `Pools`
    concatMap(() => apiGetPools$(endpoint)),
    // set `PoolAssets` into state
    tap((poolAssets) => (state = { ...state, poolAssets })),
    // load `AssetDetails`
    concatMap((poolAssets) => apiGetAssetInfo$(endpoint, poolAssets)),
    // store `AssetDetails`
    tap((assetDetails) => (state = { ...state, assetDetails })),
    // Derive + store `assetDetailIndex`
    tap((assetDetails) => (state = { ...state, assetDetailIndex: getAssetDetailIndex(assetDetails) })),
    // Derive + store `priceIndex`
    tap((assetDetails) => {
      // TODO (@Veado) Get token ticker from persistent storage (issue https://github.com/thorchain/asgardex-electron/issues/127)
      // const baseTokenTicker = getBasePriceAsset() || BASE_TOKEN_TICKER;
      const priceIndex = getPriceIndex(assetDetails, BASE_TOKEN_TICKER)
      state = { ...state, priceIndex }
    }),
    //
    concatMap((_) => apiGetPoolsData$(endpoint, state.poolAssets)),
    // Derive + store `poolDetails`
    tap((poolDetails: PoolDetails) => (state = { ...state, poolDetails: toPoolDetailsMap(poolDetails) })),
    // set everything into a `success` state
    tap((_) => poolsState$$.next(RD.success(state))),
    // catch any errors if there any
    catchError((error: Error) => {
      // set `error` state
      poolsState$$.next(RD.failure(error))
      return Rx.of('error while fetchting data for pool')
    }),
    retry(MIDGARD_MAX_RETRY)
  )
}

/**
 * Get data of `Pools` from Midgard
 */
const apiGetPools$ = (endpoint: string) => {
  const api = getMidgardDefaultApi(endpoint)
  return api.getPools()
}

/**
 * Get data of `AssetDetails` from Midgard
 */
const apiGetAssetInfo$ = (endpoint: string, poolAssets: string[]) => {
  const api = getMidgardDefaultApi(endpoint)
  return api.getAssetInfo({ asset: poolAssets.join() })
}

/**
 * Get `PoolDetails` data from Midgard
 */
const apiGetPoolsData$ = (endpoint: string, poolAssets: string[]) => {
  const api = getMidgardDefaultApi(endpoint)
  return api.getPoolsData({ asset: poolAssets.join() })
}

// Subject to trigger reload of pools state
const reloadPoolsState$$ = new Rx.BehaviorSubject(0)

/**
 * Helper to reload of data of PoolState
 */
const reloadPoolsState = () => reloadPoolsState$$.next(0)

/**
 * State of all pool data
 */
const poolState$: Rx.Observable<PoolsStateRD> = reloadPoolsState$$.pipe(
  // start loading queue
  exhaustMap((_) => getPoolsState$()),
  // return state of pool data
  mergeMap((_) => poolsState$$.asObservable())
)

/**
 * Service object with all "public" functions and observables we want provide
 */
const service = {
  poolState$,
  reloadPoolsState
}

// Default
export default service
