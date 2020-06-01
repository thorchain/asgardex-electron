import * as RD from '@devexperts/remote-data-ts'
import byzantine from '@thorchain/byzantine-module'
import * as Rx from 'rxjs'
import { retry, mergeMap, catchError, exhaustMap, shareReplay, concatMap, tap } from 'rxjs/operators'

import { AssetDetail } from '../types/generated/midgard'
import { DefaultApi } from '../types/generated/midgard/apis'
import { Configuration } from '../types/generated/midgard/runtime'

type Pools = string[]

type AssetDetails = AssetDetail[]

export type State = {
  assetDetails: AssetDetails
  pools: Pools
}

export type StateRD = RD.RemoteData<Error, State>

const poolState$$ = new Rx.BehaviorSubject<StateRD>(RD.initial)

/**
 * Helper to get `DefaultApi` instance for Midgard using custom basePath
 */
const getMidgardDefaultApi = (basePath: string) => new DefaultApi(new Configuration({ basePath }))

/**
 * Endpoint provided by Byzantine
 */
const byzantine$ = Rx.from(byzantine()).pipe(retry(5))

/**
 * Same as `byzantine$`, but as a cached value
 */
const byzantineShared$ = byzantine$.pipe(shareReplay())

/**
 * Loading queue to get all needed data for pools
 */
const loadPools$ = byzantineShared$.pipe(
  mergeMap((endpoint) => {
    //
    let state = {}
    return Rx.pipe(
      // set `pending` state
      tap((_) => poolState$$.next(RD.pending)),
      // load `Pools`
      concatMap((_) => getPools$(endpoint)),
      // store `Pools` temporary
      tap((pools) => (state = { ...state, pools })),
      // load `AssetDetails`
      concatMap((pools: string[]) => getAssetInfo$(endpoint, pools)),
      // store `AssetDetails` temporary
      tap((assetDetails) => (state = { ...state, assetDetails })),
      // set `success` state
      tap((_) => poolState$$.next(RD.success(state as State))),
      catchError((error: Error) => {
        // set `error` state
        poolState$$.next(RD.failure(error))
        return Rx.of('error while fetchting data for pool')
      })
    )
  }),
  retry(3)
)

/**
 * Get data of `Pools`
 */
const getPools$ = (endpoint: string) => {
  const api = getMidgardDefaultApi(endpoint)
  return api.getPools()
}

/**
 * Get data of `AssetDetails`
 */
const getAssetInfo$ = (endpoint: string, pools: string[]) => {
  const api = getMidgardDefaultApi(endpoint)
  return api.getAssetInfo({ asset: pools.join() })
}

const reloadPoolData$$ = new Rx.BehaviorSubject(0)

/**
 * Triggers a reload of all pool data
 */
export const reloadPoolData = () => reloadPoolData$$.next(0)

/**
 * State of all pool data
 */
export const poolState$: Rx.Observable<StateRD> = reloadPoolData$$.pipe(
  mergeMap((_) => loadPools$),
  exhaustMap((_) => poolState$$.asObservable())
)
