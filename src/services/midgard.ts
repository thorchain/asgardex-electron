import * as Rx from 'rxjs'
import { retry, mergeMap, catchError, startWith, exhaustMap } from 'rxjs/operators'
import * as RD from '@devexperts/remote-data-ts'
import byzantine from '@thorchain/byzantine-module'
import { DefaultApi } from '../types/generated/midgard/apis'
import { Configuration } from '../types/generated/midgard/runtime'

export type PoolsRD = RD.RemoteData<Error, string[]>

/**
 * Helper to get `DefaultApi` instance for Midgard using custom basePath
 */
const getMidgardDefaultApi = (basePath: string) => new DefaultApi(new Configuration({ basePath }))

/**
 * Endpoint provided by Byzantine
 */
const byzantine$ = Rx.from(byzantine()).pipe(retry(5))

/**
 * Load pools
 */
const loadPools$ = byzantine$.pipe(
  mergeMap((endpoint) => {
    const api = getMidgardDefaultApi(endpoint as string)
    return api.getPools()
  }),
  retry(3)
)

/**
 * Merge result of loadPools into RemoteData
 **/
const poolsRD$: Rx.Observable<PoolsRD> = loadPools$.pipe(
  mergeMap((response) => Rx.of(RD.success(response) as PoolsRD)),
  catchError((error: Error) => Rx.of(RD.failure(error))),
  startWith(RD.initial)
)

const reloadPools$$ = new Rx.BehaviorSubject(0)

/**
 * Triggers a reload of pools
 */
export const reloadPools = () => reloadPools$$.next(0)

/**
 * Pool data
 */
export const pools$ = reloadPools$$.pipe(exhaustMap((_) => poolsRD$))
