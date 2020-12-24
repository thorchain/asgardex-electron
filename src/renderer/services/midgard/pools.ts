import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetFromString, assetToString, bn, currencySymbolByAsset, isValidAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/Option'
import { some } from 'fp-ts/Option'
import * as Rx from 'rxjs'
import { combineLatest } from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ONE_BN, PRICE_POOLS_WHITELIST } from '../../const'
import { getRuneAsset, isPricePoolAsset } from '../../helpers/assetHelper'
import { eqAsset } from '../../helpers/fp/eq'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { LiveData, liveData } from '../../helpers/rx/liveData'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import {
  DefaultApi,
  GetPoolsRequest,
  GetPoolsStatusEnum,
  GetSwapHistoryIntervalEnum
} from '../../types/generated/midgard/apis'
import { PricePool, PricePoolAsset, PricePools } from '../../views/pools/Pools.types'
import { network$ } from '../app/service'
import { MIDGARD_MAX_RETRY } from '../const'
import {
  AssetDetailsLD,
  PendingPoolsStateLD,
  PoolAddressRx,
  PoolAssetsLD,
  PoolDetailLD,
  PoolDetailsLD,
  PoolsService,
  PoolsStateLD,
  PoolStringAssetsLD,
  SelectedPricePoolAsset,
  ThorchainEndpointsLD,
  PoolDetails
} from './types'
import { getPoolAddressByChain, getPricePools, pricePoolSelector, pricePoolSelectorFromRD } from './utils'

const PRICE_POOL_KEY = 'asgdx-price-pool'

const getStoredSelectedPricePoolAsset = (): SelectedPricePoolAsset =>
  FP.pipe(
    localStorage.getItem(PRICE_POOL_KEY) as string,
    O.fromNullable,
    O.map(assetFromString),
    O.chain(O.fromNullable),
    O.filter(isPricePoolAsset)
  )

const runeAsset$: Rx.Observable<Asset> = network$.pipe(RxOp.map((network) => getRuneAsset({ network, chain: 'BNB' })))

const createPoolsService = (
  byzantine$: LiveData<Error, string>,
  getMidgardDefaultApi: (basePath: string) => DefaultApi,
  selectedPoolAsset$: Rx.Observable<O.Option<Asset>>
): PoolsService => {
  const midgardDefailtApi$ = FP.pipe(byzantine$, liveData.map(getMidgardDefaultApi), RxOp.shareReplay(1))

  // Factory to get `Pools` from Midgard
  const apiGetPools$ = (request: GetPoolsRequest) =>
    FP.pipe(
      Rx.combineLatest([midgardDefailtApi$, reloadPools$]),
      RxOp.map(([api]) => api),
      liveData.chain((api) =>
        FP.pipe(
          api.getPools(request),
          RxOp.map(RD.success),
          RxOp.startWith(RD.pending),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      ),
      liveData.chain((details) =>
        FP.pipe(
          details,
          A.map(({ asset }) =>
            FP.pipe(
              midgardDefailtApi$,
              liveData.chain((api) =>
                FP.pipe(
                  // As midgard v2 is missing poolSlipAverage and swappingTxCount
                  // field we have to get them from getSwapHistory
                  api.getSwapHistory({
                    pool: asset,
                    interval: GetSwapHistoryIntervalEnum.Year,
                    // Emulate ALL period of a pool life
                    // And get data for last 10 years
                    from: Date.now() - 360 * 3600 * 24 * 10,
                    to: Date.now()
                  }),
                  RxOp.map(RD.success),
                  liveData.map(({ meta }) => meta),
                  RxOp.catchError(() => Rx.of(RD.failure(Error('Failed to load swaps history')))),
                  RxOp.startWith(RD.pending)
                )
              ),
              liveData.map(({ averageSlip, totalCount }) => ({
                poolSlipAverage: averageSlip,
                swappingTxCount: totalCount
              })),
              /**
               * Set default value for all failed items to avoid falling into
               * the error branch on the next step by liveData.sequenceArray
               */
              liveData.altOnError((): { poolSlipAverage: string; swappingTxCount: string } => ({
                poolSlipAverage: '0',
                swappingTxCount: '0'
              }))
            )
          ),
          liveData.sequenceArray,
          liveData.map(
            A.mapWithIndex((index, swapData) => ({
              ...swapData,
              // Here we can be sure in indexing 'cuz we have the same order
              // as details 'cuz we build this array based on details themselves
              ...details[index]
            }))
          )
        )
      ),
      RxOp.shareReplay(1)
    )

  // `TriggerStream` to reload data of pools
  const { stream$: reloadPools$, trigger: reloadPools } = triggerStream()

  /**
   * Data of enabled `Pools` from Midgard
   */
  const apiGetPoolsEnabled$: LiveData<Error, PoolDetails> = apiGetPools$({ status: GetPoolsStatusEnum.Available })

  /**
   * Ddata of pending `Pools` from Midgard
   */
  const apiGetPoolsPending$: LiveData<Error, PoolDetails> = apiGetPools$({ status: GetPoolsStatusEnum.Staged })

  /**
   * Data of `AssetDetails` from Midgard
   */
  const apiGetAssetInfo$: (assetOrAssets: string | string[]) => AssetDetailsLD = (assetOrAssets) => {
    const assets = Array.isArray(assetOrAssets) ? assetOrAssets : [assetOrAssets]

    return FP.pipe(
      apiGetPoolsEnabled$,
      liveData.map(A.filter((pool) => assets.includes(pool.asset))),
      liveData.map(
        A.map((poolDetails) => ({
          asset: poolDetails.asset,
          /**
           * Use mocked zero date as midgard v2 does not provide this
           * info yet.
           * @todo (@thatStrangeGuy) remove dateCreated from target type as we dont use it anywhere
           */
          dateCreated: 0,
          priceRune: poolDetails.assetPrice
        }))
      ),
      RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
    )
  }

  /**
   * `PoolDetails` data from Midgard
   */
  const apiGetPoolsData$: (assetOrAssets: string | string[]) => LiveData<Error, PoolDetails> = (assetOrAssets) => {
    const assets = Array.isArray(assetOrAssets) ? assetOrAssets : [assetOrAssets]

    return FP.pipe(
      apiGetPoolsEnabled$,
      liveData.map(A.filter((poolDetail) => assets.includes(poolDetail.asset))),
      liveData.map(NEA.fromArray),
      liveData.chain(
        O.fold(
          // TODO (@thatStrangeGuy | @veado) Add i18n
          (): LiveData<Error, PoolDetails> => Rx.of(RD.failure(new Error('No pools available'))),
          (poolsDetails): LiveData<Error, PoolDetails> => Rx.of(RD.success(poolsDetails))
        )
      ),
      RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
    )
  }

  // Factory to create a stream to get data of `AssetDetails`
  const getAssetDetails$: (poolAssets$: PoolStringAssetsLD) => AssetDetailsLD = (poolAssets$) =>
    FP.pipe(
      poolAssets$,
      liveData.map(NEA.fromArray),
      // provide an empty list of `AssetDetails` in case of empty list of pools
      liveData.chain(O.fold(() => liveData.of([]), apiGetAssetInfo$)),
      RxOp.shareReplay(1)
    )

  // Factory to create a stream to get data of `PoolDetails`
  const getPoolDetails$: (poolAssets$: PoolStringAssetsLD) => PoolDetailsLD = (poolAssets$) =>
    FP.pipe(
      poolAssets$,
      liveData.map(NEA.fromArray),
      // provide an empty list of `PoolDetails` in case of empty list of pools
      liveData.chain(O.fold(() => liveData.of([]), apiGetPoolsData$)),
      RxOp.shareReplay(1)
    )

  /**
   * Loading queue to get all needed data for `PoolsState`
   */
  const loadPoolsStateData$ = (): PoolsStateLD => {
    const poolAssets$: PoolStringAssetsLD = FP.pipe(apiGetPoolsEnabled$, liveData.map(A.map(({ asset }) => asset)))
    const assetDetails$ = getAssetDetails$(poolAssets$)
    const poolDetails$ = getPoolDetails$(poolAssets$)

    const pricePools$: LiveData<Error, O.Option<PricePools>> = poolDetails$.pipe(
      RxOp.map((poolDetailsRD) =>
        FP.pipe(
          poolDetailsRD,
          RD.map((poolDetails) => some(getPricePools(poolDetails, PRICE_POOLS_WHITELIST)))
        )
      ),
      RxOp.shareReplay(1)
    )

    return FP.pipe(
      combineLatest([poolAssets$, assetDetails$, poolDetails$, pricePools$]),
      RxOp.map((state) => RD.combine(...state)),
      RxOp.map(
        RD.map(([poolAssets, assetDetails, poolDetails, pricePools]) => {
          const prevAsset = getSelectedPricePoolAsset()
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
      RxOp.startWith(RD.pending),
      RxOp.catchError((error: Error) => Rx.of(RD.failure(error))),
      RxOp.retry(MIDGARD_MAX_RETRY)
    )
  }

  /**
   * State of all pool data
   */
  const poolsState$: PoolsStateLD = reloadPools$.pipe(
    // start loading queue
    RxOp.switchMap(loadPoolsStateData$),
    // cache it to avoid reloading data by every subscription
    RxOp.shareReplay(1)
  )

  /**
   * Loading queue to get all needed data for `PendingPoolsState`
   */
  const loadPendingPoolsStateData$ = (): PendingPoolsStateLD => {
    const poolAssets$: PoolStringAssetsLD = FP.pipe(apiGetPoolsPending$, liveData.map(A.map(({ asset }) => asset)))
    const assetDetails$ = getAssetDetails$(poolAssets$)
    const poolDetails$ = getPoolDetails$(poolAssets$)

    return FP.pipe(
      liveData.sequenceS({
        poolAssets: poolAssets$,
        assetDetails: assetDetails$,
        poolDetails: poolDetails$
      }),
      RxOp.startWith(RD.pending),
      RxOp.catchError((error: Error) => Rx.of(RD.failure(error))),
      RxOp.retry(MIDGARD_MAX_RETRY)
    )
  }

  /**
   * State of data of pendings pools
   */
  const pendingPoolsState$: PendingPoolsStateLD = reloadPools$.pipe(
    // start loading queue
    RxOp.switchMap(loadPendingPoolsStateData$),
    // cache it to avoid reloading data by every subscription
    RxOp.shareReplay(1)
  )

  /**
   * Stream of `PoolDetail` data based on selected pool asset
   * It's triggered by changes of selectedPoolAsset$`
   */
  const poolDetail$: PoolDetailLD = selectedPoolAsset$.pipe(
    RxOp.filter(O.isSome),
    RxOp.switchMap((selectedPoolAsset) =>
      FP.pipe(
        selectedPoolAsset,
        O.fold(
          () => Rx.of(RD.initial),
          (asset) => apiGetPoolsData$(assetToString(asset))
        )
      )
    ),
    liveData.chain(
      FP.flow(
        A.head,
        liveData.fromOption(() => Error('Empty response'))
      )
    ),
    RxOp.startWith(RD.pending),
    RxOp.shareReplay(1)
  )

  const availableAssets$: PoolAssetsLD = FP.pipe(
    poolsState$,
    liveData.map((poolsState) => poolsState.poolAssets),
    liveData.map(A.filterMap((asset) => O.fromNullable(assetFromString(asset))))
  )

  const {
    get: getSelectedPricePoolAsset,
    get$: selectedPricePoolAsset$,
    set: updateSelectedPricePoolAsset
  } = observableState<SelectedPricePoolAsset>(getStoredSelectedPricePoolAsset())

  /**
   * Update selected `PricePoolAsset`
   */
  const setSelectedPricePoolAsset = (asset: PricePoolAsset) => {
    localStorage.setItem(PRICE_POOL_KEY, assetToString(asset))
    updateSelectedPricePoolAsset(some(asset))
  }

  /**
   * Selected currency symbol
   */
  const selectedPricePoolAssetSymbol$: Rx.Observable<O.Option<string>> = selectedPricePoolAsset$.pipe(
    RxOp.map(O.map(currencySymbolByAsset))
  )

  /**
   * Selected price pool
   */
  const selectedPricePool$: Rx.Observable<PricePool> = combineLatest([poolsState$, selectedPricePoolAsset$]).pipe(
    RxOp.map(([poolsState, selectedPricePoolAsset]) => pricePoolSelectorFromRD(poolsState, selectedPricePoolAsset))
  )

  const poolAddresses$: ThorchainEndpointsLD = FP.pipe(
    midgardDefailtApi$,
    liveData.chain((api) => {
      return FP.pipe(
        api.getProxiedInboundAddresses(),
        RxOp.map(RD.success),
        RxOp.startWith(RD.pending),
        RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
      )
    }),
    liveData.map((s) => s.current || []),
    RxOp.retry(MIDGARD_MAX_RETRY)
  )

  const selectedPoolAddress$: PoolAddressRx = combineLatest([poolAddresses$, selectedPoolAsset$]).pipe(
    RxOp.map(([poolAddresses, oSelectedPoolAsset]) => {
      return FP.pipe(
        poolAddresses,
        RD.toOption,
        (oPoolAddresses) => sequenceTOption(oPoolAddresses, oSelectedPoolAsset),
        O.chain(([poolAddresses, selectedPoolAsset]) => getPoolAddressByChain(poolAddresses, selectedPoolAsset.chain))
      )
    })
  )

  const poolAddressByAsset$ = (asset: Asset): PoolAddressRx =>
    FP.pipe(
      poolAddresses$,
      liveData.toOptionMap$((addresses) => getPoolAddressByChain(addresses, asset.chain)),
      RxOp.map(O.flatten)
    )

  /**
   * Use this to convert asset's price to selected price asset by multiplying to the priceRation inner value
   */
  const priceRatio$: Rx.Observable<BigNumber> = FP.pipe(
    combineLatest([FP.pipe(poolsState$, RxOp.map(RD.toOption)), selectedPricePoolAsset$]),
    RxOp.map(([pools, selectedAsset]) => sequenceTOption(pools, selectedAsset)),
    RxOp.map(
      O.chain(([pools, selectedAsset]) =>
        FP.pipe(
          pools.assetDetails,
          A.findFirst((assetDetail) => {
            const asset = assetFromString(assetDetail?.asset || '')
            if (!asset || !isValidAsset(asset)) {
              return false
            }
            return eqAsset.equals(asset, selectedAsset)
          })
        )
      )
    ),
    RxOp.map(O.map((detail) => ONE_BN.dividedBy(bn(detail.priceRune || 1)))),
    RxOp.map(O.getOrElse(() => ONE_BN))
  )

  return {
    poolsState$,
    pendingPoolsState$,
    setSelectedPricePoolAsset,
    selectedPricePoolAsset$,
    selectedPricePool$,
    selectedPricePoolAssetSymbol$,
    reloadPools,
    poolAddresses$,
    selectedPoolAddress$: selectedPoolAddress$,
    runeAsset$,
    poolDetail$,
    priceRatio$,
    availableAssets$,
    poolAddressByAsset$
  }
}

export { runeAsset$, createPoolsService, getStoredSelectedPricePoolAsset as getSelectedPricePool }
