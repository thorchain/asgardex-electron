import * as Rx from 'rxjs'
import { ajax, AjaxResponse } from 'rxjs/ajax'
import { retry, mergeMap, catchError, startWith, exhaustMap, map } from 'rxjs/operators'
import * as RD from '@devexperts/remote-data-ts'
import byzantine from '@thorchain/byzantine-module'

export type PoolsRD = RD.RemoteData<Error, string[]>

/**
 * Endpoint provided by Byzantine
 */
const byzantine$ = Rx.from(byzantine()).pipe(retry(5))

/**
 * Load pools
 */
const loadPools$ = byzantine$.pipe(mergeMap((endpoint) => ajax(`${endpoint}/v1/pools`))).pipe(
  retry(3),
  map(({ response }: AjaxResponse) => response as string[])
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
