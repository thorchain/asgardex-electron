import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetFromString, assetToString, bn, Chain, currencySymbolByAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/Option'
import { some } from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ONE_BN, PRICE_POOLS_WHITELIST } from '../../const'
import { isPricePoolAsset, midgardAssetFromString } from '../../helpers/assetHelper'
import { isEnabledChain } from '../../helpers/chainHelper'
import { eqAsset } from '../../helpers/fp/eq'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { LiveData, liveData } from '../../helpers/rx/liveData'
import { observableState, triggerStream, TriggerStream$ } from '../../helpers/stateHelper'
import { DefaultApi, GetPoolsRequest, GetPoolsStatusEnum } from '../../types/generated/midgard/apis'
import { PricePool, PricePoolAsset, PricePools } from '../../views/pools/Pools.types'
import { ErrorId } from '../wallet/types'
import {
  PoolAssetDetailsLD,
  PendingPoolsStateLD,
  PoolAddressRx,
  PoolAddressLD,
  PoolAssetsLD,
  PoolDetailLD,
  PoolDetailsLD,
  PoolsService,
  PoolsStateLD,
  SelectedPricePoolAsset,
  ThorchainEndpointsLD,
  ValidatePoolLD,
  PoolRouterRx
} from './types'
import {
  getPoolAddressByChain,
  getPoolAssetDetail,
  getPoolRouterByChain,
  getPricePools,
  pricePoolSelector,
  pricePoolSelectorFromRD
} from './utils'

const PRICE_POOL_KEY = 'asgdx-price-pool'

const getStoredSelectedPricePoolAsset = (): SelectedPricePoolAsset =>
  FP.pipe(
    localStorage.getItem(PRICE_POOL_KEY) as string,
    O.fromNullable,
    O.map(assetFromString),
    O.chain(O.fromNullable),
    O.filter(isPricePoolAsset)
  )

const createPoolsService = (
  byzantine$: LiveData<Error, string>,
  getMidgardDefaultApi: (basePath: string) => DefaultApi,
  selectedPoolAsset$: Rx.Observable<O.Option<Asset>>
): PoolsService => {
  const midgardDefaultApi$ = FP.pipe(byzantine$, liveData.map(getMidgardDefaultApi), RxOp.shareReplay(1))

  // Factory to get `Pools` from Midgard
  const apiGetPools$ = (request: GetPoolsRequest, reload$: TriggerStream$) =>
    FP.pipe(
      Rx.combineLatest([midgardDefaultApi$, reload$]),
      RxOp.map(([api]) => api),
      liveData.chain((api) =>
        FP.pipe(
          api.getPools(request),
          RxOp.map(RD.success),
          // Filter `PoolDetails`by using enabled chains only (defined via ENV)
          liveData.map(
            A.filter(({ asset }) =>
              FP.pipe(
                asset,
                midgardAssetFromString,
                O.fold(
                  () => false,
                  ({ chain }) => isEnabledChain(chain)
                )
              )
            )
          ),
          // filter out
          RxOp.startWith(RD.pending),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      ),
      liveData.chain((details) =>
        FP.pipe(
          details,
          A.map(({ asset }) =>
            FP.pipe(
              midgardDefaultApi$,
              liveData.chain((api) =>
                FP.pipe(
                  // As midgard v2 is missing poolSlipAverage and swappingTxCount
                  // field we have to get them from getSwapHistory
                  // Emulate ALL period of a pool life
                  api.getSwapHistory({
                    pool: asset
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
  const apiGetPoolsEnabled$: PoolDetailsLD = apiGetPools$({ status: GetPoolsStatusEnum.Available }, reloadPools$)

  // `TriggerStream` to reload data of pending pools
  const { stream$: reloadPendingPools$, trigger: reloadPendingPools } = triggerStream()

  /**
   * Data of pending `Pools` from Midgard
   */
  const apiGetPoolsPending$: PoolDetailsLD = apiGetPools$({ status: GetPoolsStatusEnum.Staged }, reloadPendingPools$)

  // `TriggerStream` to reload data of all pools
  const { stream$: reloadAllPools$, trigger: reloadAllPools } = triggerStream()

  /**
   * Data of all `Pools`
   */
  const apiGetPoolsAll$: PoolDetailsLD = apiGetPools$({ status: undefined }, reloadAllPools$)

  /**
   * Helper to get (same) stream of `PoolDetailsLD` by given status
   *
   * If status is not set (or undefined), `PoolDetails` of all Pools will be loaded
   */
  const apiGetPoolsByStatus$ = (status?: GetPoolsStatusEnum) => {
    switch (status) {
      case GetPoolsStatusEnum.Available:
        return apiGetPoolsEnabled$
      case GetPoolsStatusEnum.Staged:
        return apiGetPoolsPending$
      default:
        return apiGetPoolsAll$
    }
  }
  /**
   * Data of `AssetDetails` from Midgard
   */
  const apiGetAssetInfo$: (assetOrAssets: string | string[], status: GetPoolsStatusEnum) => PoolAssetDetailsLD = (
    assetOrAssets,
    status
  ) => {
    const assets = Array.isArray(assetOrAssets) ? assetOrAssets : [assetOrAssets]

    return FP.pipe(
      apiGetPoolsByStatus$(status),
      liveData.map(A.filter((pool) => assets.includes(pool.asset))),
      liveData.map(A.filterMap(getPoolAssetDetail)),
      RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
    )
  }

  /**
   * `PoolDetails` data from Midgard
   */
  const apiGetPoolsData$: (assetOrAssets: string | string[], status?: GetPoolsStatusEnum) => PoolDetailsLD = (
    assetOrAssets,
    status
  ) => {
    const assets = Array.isArray(assetOrAssets) ? assetOrAssets : [assetOrAssets]

    return FP.pipe(
      apiGetPoolsByStatus$(status),
      liveData.map(A.filter((poolDetail) => assets.includes(poolDetail.asset))),
      liveData.map(NEA.fromArray),
      liveData.chain(
        O.fold(
          // TODO (@thatStrangeGuy | @veado) Add i18n
          (): PoolDetailsLD => Rx.of(RD.failure(new Error('No pools available'))),
          (poolsDetails): PoolDetailsLD => Rx.of(RD.success(poolsDetails))
        )
      ),
      RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
    )
  }

  // Factory to create a stream to get data of `AssetDetails`
  const getAssetDetails$: (poolAssets$: PoolAssetsLD, status: GetPoolsStatusEnum) => PoolAssetDetailsLD = (
    poolAssets$,
    status
  ) =>
    FP.pipe(
      poolAssets$,
      liveData.map(A.map(assetToString)),
      liveData.map(NEA.fromArray),
      // provide an empty list of `AssetDetails` in case of empty list of pools
      liveData.chain(
        O.fold(
          () => liveData.of([]),
          (assets) => apiGetAssetInfo$(assets, status)
        )
      ),
      RxOp.shareReplay(1)
    )

  // Factory to create a stream to get data of `PoolDetails`
  const getPoolDetails$: (poolAssets$: PoolAssetsLD, status: GetPoolsStatusEnum) => PoolDetailsLD = (
    poolAssets$,
    status
  ) =>
    FP.pipe(
      poolAssets$,
      liveData.map(A.map(assetToString)),
      liveData.map(NEA.fromArray),
      // provide an empty list of `PoolDetails` in case of empty list of pools
      liveData.chain(
        O.fold(
          () => liveData.of([]),
          (assets) => apiGetPoolsData$(assets, status)
        )
      ),
      RxOp.shareReplay(1)
    )

  /**
   * Loading queue to get all needed data for `PoolsState`
   */
  const loadPoolsStateData$ = (): PoolsStateLD => {
    const poolAssets$: PoolAssetsLD = FP.pipe(
      apiGetPoolsEnabled$,
      // Filter out all unknown / invalid assets created from asset strings
      liveData.map(A.filterMap(({ asset }) => FP.pipe(asset, assetFromString, O.fromNullable))),
      // Filter pools by using enabled chains only (defined via ENV)
      liveData.map(A.filter(({ chain }) => isEnabledChain(chain))),
      RxOp.shareReplay(1)
    )
    const assetDetails$ = getAssetDetails$(poolAssets$, GetPoolsStatusEnum.Available)
    const poolDetails$ = getPoolDetails$(poolAssets$, GetPoolsStatusEnum.Available)

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
      Rx.combineLatest([poolAssets$, assetDetails$, poolDetails$, pricePools$]),
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
      RxOp.catchError((error: Error) => Rx.of(RD.failure(error)))
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
    const poolAssets$: PoolAssetsLD = FP.pipe(
      apiGetPoolsPending$,
      // Filter out all unknown / invalid assets created from asset strings
      liveData.map(A.filterMap(({ asset }) => FP.pipe(asset, assetFromString, O.fromNullable))),
      // Filter pools by using enabled chains only (defined via ENV)
      liveData.map(A.filter(({ chain }) => isEnabledChain(chain))),
      RxOp.shareReplay(1)
    )
    const assetDetails$ = getAssetDetails$(poolAssets$, GetPoolsStatusEnum.Staged)
    const poolDetails$ = getPoolDetails$(poolAssets$, GetPoolsStatusEnum.Staged)

    return FP.pipe(
      liveData.sequenceS({
        poolAssets: poolAssets$,
        assetDetails: assetDetails$,
        poolDetails: poolDetails$
      }),
      RxOp.startWith(RD.pending),
      RxOp.catchError((error: Error) => Rx.of(RD.failure(error)))
    )
  }

  /**
   * State of data of pendings pools
   */
  const pendingPoolsState$: PendingPoolsStateLD = reloadPendingPools$.pipe(
    // start loading queue
    RxOp.switchMap(loadPendingPoolsStateData$),
    // cache it to avoid reloading data by every subscription
    RxOp.shareReplay(1)
  )

  /**
   * Stream of `PoolDetail` data based on selected pool asset
   * It's triggered by changes of selectedPoolAsset$`
   *
   * Note: It checks currenlty ALL (pending/available) pool details
   * That's needed for Deposit pages, which have not the information about status of pool right now (might be improved if needed)
   */
  const poolDetail$: PoolDetailLD = selectedPoolAsset$.pipe(
    RxOp.filter(O.isSome),
    RxOp.switchMap((selectedPoolAsset) =>
      FP.pipe(
        selectedPoolAsset,
        O.fold(
          () => Rx.of(RD.initial),
          (asset) =>
            apiGetPoolsData$(
              assetToString(asset),
              undefined /* explicit set to `undefined` to remember we want data for all pools */
            )
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
    liveData.map((poolsState) => poolsState.poolAssets)
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
  const selectedPricePool$: Rx.Observable<PricePool> = Rx.combineLatest([poolsState$, selectedPricePoolAsset$]).pipe(
    RxOp.map(([poolsState, selectedPricePoolAsset]) => pricePoolSelectorFromRD(poolsState, selectedPricePoolAsset))
  )

  const poolAddresses$: ThorchainEndpointsLD = FP.pipe(
    midgardDefaultApi$,
    liveData.chain((api) => {
      return FP.pipe(
        api.getProxiedInboundAddresses(),
        RxOp.map(RD.success),
        RxOp.startWith(RD.pending),
        RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
      )
    })
  )

  const selectedPoolAddress$: PoolAddressRx = Rx.combineLatest([poolAddresses$, selectedPoolAsset$]).pipe(
    RxOp.map(([poolAddresses, oSelectedPoolAsset]) => {
      return FP.pipe(
        poolAddresses,
        RD.toOption,
        (oPoolAddresses) => sequenceTOption(oPoolAddresses, oSelectedPoolAsset),
        O.chain(([poolAddresses, selectedPoolAsset]) => getPoolAddressByChain(poolAddresses, selectedPoolAsset.chain))
      )
    })
  )

  const selectedPoolRouter$: PoolRouterRx = Rx.combineLatest([poolAddresses$, selectedPoolAsset$]).pipe(
    RxOp.map(([poolAddresses, oSelectedPoolAsset]) => {
      return FP.pipe(
        poolAddresses,
        RD.toOption,
        (oPoolAddresses) => sequenceTOption(oPoolAddresses, oSelectedPoolAsset),
        O.chain(([poolAddresses, selectedPoolAsset]) => getPoolRouterByChain(poolAddresses, selectedPoolAsset.chain))
      )
    })
  )

  const oPoolAddressByChain$ = (chain: Chain): PoolAddressRx =>
    FP.pipe(
      poolAddresses$,
      liveData.toOptionMap$((addresses) => getPoolAddressByChain(addresses, chain)),
      RxOp.map(O.flatten)
    )

  const poolAddressByChain$ = (chain: Chain): PoolAddressLD =>
    FP.pipe(
      poolAddresses$,
      liveData.map((endpoints) => getPoolAddressByChain(endpoints, chain)),
      RxOp.map((rd) =>
        FP.pipe(
          rd,
          // TODO @(Veado) Add i18n
          RD.chain((oAddress) => RD.fromOption(oAddress, () => Error('Could not find pool address')))
        )
      )
    )

  const poolAddressByAsset$ = ({ chain }: Asset): PoolAddressRx => oPoolAddressByChain$(chain)

  const oPoolRouterByChain$ = (chain: Chain): PoolRouterRx =>
    FP.pipe(
      poolAddresses$,
      liveData.toOptionMap$((addresses) => getPoolRouterByChain(addresses, chain)),
      RxOp.map(O.flatten)
    )

  const poolRouterByAsset$ = ({ chain }: Asset): PoolRouterRx => oPoolRouterByChain$(chain)

  /**
   * Use this to convert asset's price to selected price asset by multiplying to the priceRation inner value
   */
  const priceRatio$: Rx.Observable<BigNumber> = FP.pipe(
    Rx.combineLatest([FP.pipe(poolsState$, RxOp.map(RD.toOption)), selectedPricePoolAsset$]),
    RxOp.map(([pools, selectedAsset]) => sequenceTOption(pools, selectedAsset)),
    RxOp.map(
      O.chain(([pools, selectedAsset]) =>
        FP.pipe(
          pools.assetDetails,
          A.findFirst(({ asset }) => eqAsset.equals(asset, selectedAsset))
        )
      )
    ),
    RxOp.map(O.map((detail) => ONE_BN.dividedBy(bn(detail.assetPrice || 1)))),
    RxOp.map(O.getOrElse(() => ONE_BN))
  )

  /**
   * Validates pool address
   *
   * @param poolAddress Pool address to validate
   * @param chain Chain of pool to validate
   */
  const validatePool$ = (poolAddress: string, chain: Chain): ValidatePoolLD => {
    return poolAddressByChain$(chain).pipe(
      liveData.chain((address) =>
        address === poolAddress
          ? Rx.of(RD.success(true))
          : // TODO (@veado) Add i18n
            Rx.of(RD.failure(Error(`Pool with address ${poolAddress} is not available`)))
      ),
      liveData.mapLeft((error) => ({
        errorId: ErrorId.VALIDATE_POOL,
        msg: error?.message ?? error.toString()
      })),
      // RxOp.startWith(RD.pending),
      RxOp.catchError((error: Error) =>
        Rx.of(
          RD.failure({
            errorId: ErrorId.VALIDATE_POOL,
            msg: error?.message ?? error.toString()
          })
        )
      )
    )
  }

  return {
    poolsState$,
    pendingPoolsState$,
    setSelectedPricePoolAsset,
    selectedPricePoolAsset$,
    selectedPricePool$,
    selectedPricePoolAssetSymbol$,
    reloadPools,
    reloadPendingPools,
    reloadAllPools,
    poolAddresses$,
    selectedPoolAddress$,
    selectedPoolRouter$,
    poolDetail$,
    priceRatio$,
    availableAssets$,
    poolAddressByAsset$,
    validatePool$,
    poolRouterByAsset$
  }
}

export { createPoolsService, getStoredSelectedPricePoolAsset as getSelectedPricePool }
