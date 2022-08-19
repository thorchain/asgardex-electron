import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset, assetFromString, baseAmount, bnOrZero } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { optionFromNullableString } from '../../../shared/utils/fp'
import { THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { liveData } from '../../helpers/rx/liveData'
import { triggerStream, observableState } from '../../helpers/stateHelper'
import { MemberPool } from '../../types/generated/midgard'
import { DefaultApi } from '../../types/generated/midgard/apis'
import { MidgardUrlLD, PoolShare, PoolShareLD, PoolSharesLD } from './types'
import { combineShares, combineSharesByAsset, getSharesByAssetAndType, getSymSharesByAddress } from './utils'

const createSharesService = (midgardUrl$: MidgardUrlLD, getMidgardDefaultApi: (basePath: string) => DefaultApi) => {
  const api$ = midgardUrl$.pipe(RxOp.map(RD.map(getMidgardDefaultApi)))

  /**
   * We need a possibility to reload shares info with delay for this
   * purpose we need to use observableState instead of plain triggerStream here
   * @example after sending deposit tx there is no sense to reload shares info
   *          right after deposit-tx was succeed
   */
  const { get$: reloadSharesWithTimer$, set: reloadSharesWithTimer } = observableState<number>(0)

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
      Rx.combineLatest([api$, reloadSharesWithTimer$]),
      RxOp.switchMap(([api, delayTime]) =>
        FP.pipe(
          Rx.timer(delayTime),
          RxOp.switchMap(() => Rx.of(api)),
          RxOp.startWith(RD.pending as RD.RemoteData<Error, DefaultApi>)
        )
      ),
      liveData.chain((api) =>
        FP.pipe(
          api.getMemberDetail({ address }),
          RxOp.map(RD.success),
          liveData.map(({ pools }) => pools),
          liveData.mapLeft(() => Error('No pool found')),
          RxOp.catchError((e) => {
            /**
             * 404 response is returned in 2 cases:
             * 1. Pool doesn't exist at all
             * 2. User has no any stake units for the pool
             * In both cases return empty array as `No Data` identifier
             */
            if ('status' in e && e.status === 404) {
              return Rx.of(RD.success([]))
            }

            /**
             * In all other cases return error as is
             */
            return Rx.of(RD.failure(Error(e)))
          }),
          RxOp.startWith(RD.pending)
        )
      ),
      liveData.map((poolDetails) =>
        FP.pipe(
          poolDetails,
          A.filterMap<MemberPool, PoolShare>(({ pool, liquidityUnits, runeAddress, assetAddress, assetAdded }) =>
            // ignore all invalid pool strings
            FP.pipe(
              pool,
              assetFromString,
              O.fromNullable,
              O.map((asset) => ({
                type: !!runeAddress && !!assetAddress ? 'sym' : 'asym',
                assetAddress: optionFromNullableString(assetAddress),
                runeAddress: optionFromNullableString(runeAddress),
                asset,
                units: bnOrZero(liquidityUnits),
                // BaseAmount of added asset - Note: Thorchain treats all assets as 1e8 decimal based
                assetAddedAmount: baseAmount(bnOrZero(assetAdded), THORCHAIN_DECIMAL)
              }))
            )
          )
        )
      )
    )

  /**
   * `sym` `Poolshare` of an `Asset`
   *
   * @param address
   * @param asset
   */
  const symShareByAsset$ = (address: Address, asset: Asset): PoolShareLD =>
    shares$(address).pipe(liveData.map((shares) => getSharesByAssetAndType({ shares, asset, type: 'sym' })))

  /**
   * `sym` share by given `Asset` address
   *
   * @param assetAddress Asset address
   */
  const symShareByAddress$ = (assetAddress: Address): PoolSharesLD =>
    shares$(assetAddress).pipe(liveData.map((shares) => getSymSharesByAddress(shares, assetAddress)))

  /**
   * `asym` `Poolshare` of an `Asset`
   *
   * @param address
   * @param asset
   */
  const asymShareByAsset$ = (address: Address, asset: Asset): PoolShareLD =>
    shares$(address).pipe(liveData.map((shares) => getSharesByAssetAndType({ shares, asset, type: 'asym' })))

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

  // `TriggerStream` to reload `combineSharesByAddresses`
  const { stream$: reloadCombineSharesByAddresses$, trigger: reloadCombineSharesByAddresses } = triggerStream()

  // `TriggerStream` to reload `allSharesByAddresses`
  const { stream$: reloadAllSharesByAddresses$, trigger: reloadAllSharesByAddresses } = triggerStream()

  // Loads and combines `PoolShare`'s by given addresses
  const loadCombineSharesByAddresses$ = (addresses: Address[]): PoolSharesLD =>
    FP.pipe(addresses, A.map(combineShares$), liveData.sequenceArray, liveData.map(A.flatten))

  // Loads `asym` + `sym` `PoolShare`'s by given addresses
  const loadAllSharesByAddresses$ = (addresses: Address[]): PoolSharesLD =>
    FP.pipe(addresses, A.map(shares$), liveData.sequenceArray, liveData.map(A.flatten))

  // `TriggerStream` to reload `symSharesByAddresses`
  const { stream$: reloadSymSharesByAddresses$, trigger: reloadSymSharesByAddresses } = triggerStream()

  // Loads sym. `PoolShare`'s by given addresses
  const loadSymSharesByAddresses$ = (addresses: Address[]): PoolSharesLD =>
    FP.pipe(addresses, A.map(symShareByAddress$), liveData.sequenceArray, liveData.map(A.flatten))

  const symSharesByAddresses$ = (addresses: Address[]): PoolSharesLD =>
    FP.pipe(
      reloadSymSharesByAddresses$,
      RxOp.debounceTime(300),
      RxOp.switchMap(() => loadSymSharesByAddresses$(addresses))
    )

  /**
   * Loads `PoolShare`'s by given `Address`es
   * and combines 'asym` + `sym` `Poolshare`'s into a single `Poolshare`
   *
   * Stream will be re-triggered by calling `reloadCombineSharesByAddresses`
   */
  const combineSharesByAddresses$ = (addresses: Address[]): PoolSharesLD =>
    FP.pipe(
      reloadCombineSharesByAddresses$,
      RxOp.debounceTime(300),
      RxOp.switchMap(() => loadCombineSharesByAddresses$(addresses))
    )

  /**
   * Loads 'asym` + `sym` `PoolShare`'s by given `Address`es
   * Stream will be re-triggered by calling `reloadAllSharesByAddresses`
   */
  const allSharesByAddresses$ = (addresses: Address[]): PoolSharesLD =>
    FP.pipe(
      reloadAllSharesByAddresses$,
      RxOp.debounceTime(300),
      RxOp.switchMap(() => loadAllSharesByAddresses$(addresses))
    )

  return {
    shares$,
    reloadShares: (delayTime = 0) => reloadSharesWithTimer(delayTime),
    symShareByAsset$,
    asymShareByAsset$,
    combineShares$,
    combineSharesByAsset$,
    combineSharesByAddresses$,
    reloadCombineSharesByAddresses,
    symSharesByAddresses$,
    allSharesByAddresses$,
    reloadAllSharesByAddresses,
    reloadSymSharesByAddresses
  }
}

export { createSharesService }
