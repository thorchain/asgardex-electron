import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { liveData, LiveData } from '../../helpers/rx/liveData'
import { DefaultApi } from '../../types/generated/midgard/apis'
import { StakersAssetDataLD } from './types'

const createStakeService = (
  byzantine$: LiveData<Error, string>,
  getMidgardDefaultApi: (basePath: string) => DefaultApi
) => {
  const api$ = byzantine$.pipe(RxOp.map(RD.map(getMidgardDefaultApi)))

  /**
   * `api.getStakersAddressAndAssetData` will return a new stream
   * and once http request is completed (resolved/failed) end
   * stream will be completed too and there will not be any
   * effects at the subscription callback as stream is completed.
   * That's why we need to create new stream via factory to have
   * a single stream per http request
   * @example /src/renderer/views/deposit/share/ShareView.tsx
   */
  const getStakes$ = (asset: Asset, address: Address): StakersAssetDataLD =>
    FP.pipe(
      api$.pipe(
        liveData.chain((api) =>
          FP.pipe(
            api.getMemberDetail({ address }),
            RxOp.map(RD.success),
            liveData.map(({ pools }) => pools),
            liveData.chain(
              FP.flow(
                A.findFirst((poolDetails) => poolDetails.pool === assetToString(asset)),
                liveData.fromOption(() => Error(`No pool found for ${assetToString(asset)}`))
              )
            )
          )
        ),
        liveData.map((poolDetails) => ({
          asset: poolDetails.pool,
          assetStaked: poolDetails.assetAdded,
          assetWithdrawn: poolDetails.assetWithdrawn,
          dateFirstStaked: Number(poolDetails.dateFirstAdded),
          runeStaked: poolDetails.runeAdded,
          runeWithdrawn: poolDetails.runeWithdrawn,
          units: poolDetails.liquidityUnits
        })),
        // RxOp.tap((value) => console.log('tap 4:', value)),
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

  return {
    getStakes$
  }
}

export { createStakeService }
