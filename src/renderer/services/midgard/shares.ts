import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset, assetFromString, baseAmount, bnOrZero } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { eqAsset } from '../../helpers/fp/eq'
import { liveData, LiveData } from '../../helpers/rx/liveData'
import { MemberPool } from '../../types/generated/midgard'
import { DefaultApi } from '../../types/generated/midgard/apis'
import { PoolShare, PoolShareLD, PoolSharesLD } from './types'
import { combineShares, combineSharesByAsset } from './utils'

const createSharesService = (
  byzantine$: LiveData<Error, string>,
  getMidgardDefaultApi: (basePath: string) => DefaultApi
) => {
  const api$ = byzantine$.pipe(RxOp.map(RD.map(getMidgardDefaultApi)))

  /**
   * Returns `PoolShares` by given member address
   *
   * Note: `api.getMemberDetail` will return a new stream
   * and once http request is completed (resolved/failed) end
   * stream will be completed too and there will not be any
   * effects at the subscription callback as stream is completed.
   * That's why we need to create new stream via factory to have
   * a single stream per http request
   *
   * @example /src/renderer/views/deposit/share/ShareView.tsx
   */
  const shares$ = (address: Address): PoolSharesLD =>
    FP.pipe(
      api$.pipe(
        liveData.chain((api) =>
          FP.pipe(
            api.getMemberDetail({ address }),
            RxOp.map(RD.success),
            liveData.map(({ pools }) => pools),
            liveData.mapLeft(() => Error('No pool found'))
          )
        ),
        liveData.map((poolDetails) =>
          FP.pipe(
            poolDetails,
            A.filterMap<MemberPool, PoolShare>(({ pool, liquidityUnits, runeAddress, assetAddress }) =>
              // ignore all invalid pool strings
              FP.pipe(
                pool,
                assetFromString,
                O.fromNullable,
                O.map((asset) => ({
                  type: !!runeAddress && !!assetAddress ? 'sym' : 'asym',
                  asset,
                  // `liquidityUnits` are RUNE based, provided as `BaseAmount`
                  units: baseAmount(bnOrZero(liquidityUnits), THORCHAIN_DECIMAL)
                }))
              )
            )
          )
        ),
        RxOp.catchError((e) => {
          /**
           * 404 response is returned in 2 cases:
           * 1. Pool doesn't exist at all
           * 2. User has no any stake units for the pool
           * In both cases return initial state as `No Data` identifier
           */
          if ('status' in e && e.status === 404) {
            return Rx.of(RD.initial)
          }

          /**
           * In all other cases return error as is
           */
          return Rx.of(RD.failure(Error(e)))
        }),
        RxOp.startWith(RD.pending)
      )
    )

  /**
   * `sym` `Poolshare` of an `Asset`
   *
   * @param address
   * @param asset
   */
  const symShareByAsset$ = (address: Address, asset: Asset): PoolShareLD =>
    shares$(address).pipe(
      liveData.map((shares) =>
        FP.pipe(
          shares,
          A.filter(({ asset: shareAsset, type }) => eqAsset.equals(asset, shareAsset) && type === 'sym'),
          A.head
        )
      )
    )

  /**
   * `sym` `Poolshare` of an `Asset`
   *
   * @param address
   * @param asset
   */
  const asymShareByAsset$ = (address: Address, asset: Asset): PoolShareLD =>
    shares$(address).pipe(
      liveData.map((shares) =>
        FP.pipe(
          shares,
          A.filter(({ asset: shareAsset, type }) => eqAsset.equals(asset, shareAsset) && type === 'asym'),
          A.head
        )
      )
    )

  /**
   * Combines 'asym` +  `sym` `Poolshare`'s into a single `Poolshare`
   */
  const combineShares$ = (address: Address): PoolSharesLD =>
    shares$(address).pipe(liveData.map((shares) => combineShares(shares)))

  /**
   * Combines 'asym` +  `sym` `Poolshare`'s into a single `Poolshare` by given `Asset`
   */
  const combineSharesByAsset$ = (address: Address, asset: Asset): PoolShareLD =>
    shares$(address).pipe(liveData.map((shares) => combineSharesByAsset(shares, asset)))

  return {
    shares$,
    symShareByAsset$,
    asymShareByAsset$,
    combineShares$,
    combineSharesByAsset$
  }
}

export { createSharesService }
