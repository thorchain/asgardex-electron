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
import { eqAsset, eqOPoolAddresses } from '../../helpers/fp/eq'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { RUNE_POOL_ADDRESS } from '../../helpers/poolHelper'
import { LiveData, liveData } from '../../helpers/rx/liveData'
import { observableState, triggerStream, TriggerStream$ } from '../../helpers/stateHelper'
import {
  DefaultApi,
  GetLiquidityHistoryRequest,
  GetPoolsRequest,
  GetPoolsStatusEnum,
  GetPoolStatsLegacyRequest,
  GetPoolStatsPeriodEnum,
  GetPoolStatsRequest
} from '../../types/generated/midgard/apis'
import { PricePool, PricePoolAsset, PricePools } from '../../views/pools/Pools.types'
import { ErrorId } from '../wallet/types'
import {
  PoolAssetDetailsLD,
  PendingPoolsStateLD,
  PoolAssetsLD,
  PoolDetailLD,
  PoolDetailsLD,
  PoolsService,
  PoolsStateLD,
  SelectedPricePoolAsset,
  PoolAddressesLD,
  ValidatePoolLD,
  PoolAddress$,
  PoolAddressLD,
  PoolAddress,
  PoolFilter,
  PoolStatsDetailLD,
  PoolLegacyDetailLD,
  PoolLiquidityHistoryLD,
  PoolLiquidityHistoryParams
} from './types'
import {
  getPoolAddressesByChain,
  getPoolAssetDetail,
  getPricePools,
  pricePoolSelector,
  pricePoolSelectorFromRD,
  toPoolAddresses
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

  const { get$: poolsFilters$, set: _setPoolsFilter, get: internalGetPoolsFilter } = observableState<
    Record<string, O.Option<PoolFilter>>
  >({})

  const setPoolsFilter = (poolKey: string, filterValue: O.Option<PoolFilter>) => {
    const currentState = internalGetPoolsFilter()
    _setPoolsFilter({ ...currentState, [poolKey]: filterValue })
  }

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
   * `PoolDetail data from Midgard
   */
  const apiGetPoolDetail$ = (asset: Asset): PoolDetailLD =>
    FP.pipe(
      midgardDefaultApi$,
      liveData.chain((api) => {
        return FP.pipe(
          api.getPool({ asset: assetToString(asset) }),
          // Setting zero for `poolSlipAverage` + `swappingTxCount`
          // since we don't need those in pool detail atm
          // TODO (@asdgdx-team: Do we still need `poolSlipAverage` + `swappingTxCount` in PoolDetail ??
          RxOp.map((poolDetail) => ({ poolSlipAverage: '0', swappingTxCount: '0', ...poolDetail })),
          RxOp.map(RD.success),
          RxOp.startWith(RD.pending),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      }),
      RxOp.shareReplay(1)
    )

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
  const getPoolDetails$: (poolAssets$: PoolAssetsLD, status?: GetPoolsStatusEnum) => PoolDetailsLD = (
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
   * Loading queue to get `PoolDetails` of all pools
   */
  const loadAllPoolsDetails$ = (): PoolDetailsLD => {
    const poolAssets$: PoolAssetsLD = FP.pipe(
      apiGetPoolsAll$,
      // Filter out all unknown / invalid assets created from asset strings
      liveData.map(A.filterMap(({ asset }) => FP.pipe(asset, assetFromString, O.fromNullable))),
      // Filter pools by using enabled chains only (defined via ENV)
      liveData.map(A.filter(({ chain }) => isEnabledChain(chain))),
      RxOp.shareReplay(1)
    )

    return FP.pipe(
      getPoolDetails$(poolAssets$),
      RxOp.startWith(RD.pending),
      RxOp.catchError((error: Error) => Rx.of(RD.failure(error)))
    )
  }

  /**
   * `PoolDetails` of all pools
   */
  const allPoolDetails$: PoolDetailsLD = reloadPools$.pipe(
    // start loading queue
    RxOp.switchMap(loadAllPoolsDetails$),
    // cache it to avoid reloading data by every subscription
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
   * State of data of available pools
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

  const { get$: reloadSelectedPoolDetail$, set: _reloadSelectedPoolDetail } = observableState(0)

  /**
   * Stream of `PoolDetail` data based on selected pool asset
   * It's triggered by changes of selectedPoolAsset$` + `reloadSelectedPoolDetail$`
   */
  const selectedPoolDetail$: PoolDetailLD = Rx.combineLatest([selectedPoolAsset$, reloadSelectedPoolDetail$]).pipe(
    RxOp.switchMap(([oSelectedPoolAsset, delay]) =>
      FP.pipe(
        Rx.timer(delay),
        RxOp.switchMap(() => Rx.of(oSelectedPoolAsset))
      )
    ),
    RxOp.filter(O.isSome),
    RxOp.switchMap((selectedPoolAsset) => {
      return FP.pipe(
        selectedPoolAsset,
        O.fold(() => Rx.of(RD.initial), apiGetPoolDetail$)
      )
    }),
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

  const loadInboundAddresses$ = (): PoolAddressesLD =>
    FP.pipe(
      midgardDefaultApi$,
      liveData.chain((api) => {
        return FP.pipe(
          api.getProxiedInboundAddresses(),
          RxOp.map(toPoolAddresses),
          // Add "empty" rune "pool address" - we never had such pool, but do need it to calculate tx
          RxOp.map(FP.flow(A.cons(RUNE_POOL_ADDRESS))),
          RxOp.map(RD.success),
          RxOp.startWith(RD.pending),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      })
    )

  // Trigger to reload pool addresses (`inbound_addresses`)
  const { stream$: reloadPoolAddresses$, trigger: reloadPoolAddresses } = triggerStream()

  const poolAddressesInterval$ = Rx.timer(0 /* no delay for first value */, 5 * 60 * 1000 /* delay of 5 min  */)
  const poolAddresses$: PoolAddressesLD = Rx.combineLatest([reloadPoolAddresses$, poolAddressesInterval$]).pipe(
    RxOp.switchMap((_) => loadInboundAddresses$())
  )

  const selectedPoolAddress$: PoolAddress$ = Rx.combineLatest([poolAddresses$, selectedPoolAsset$]).pipe(
    RxOp.map(([poolAddresses, oSelectedPoolAsset]) => {
      return FP.pipe(
        poolAddresses,
        RD.toOption,
        // TODO (@Veado) Will we ingore router for some cases (e.g. by withdrawing something from ETH vault not using router)=
        (oPoolAddresses) => sequenceTOption(oPoolAddresses, oSelectedPoolAsset),
        O.chain(([addresses, { chain }]) => getPoolAddressesByChain(addresses, chain))
      )
    })
  )

  const poolAddressesByChain$ = (chain: Chain): PoolAddressLD =>
    FP.pipe(
      poolAddresses$,
      liveData.map((addresses) => getPoolAddressesByChain(addresses, chain)),
      RxOp.map((rd) =>
        FP.pipe(
          rd,
          // TODO @(Veado) Add i18n
          RD.chain((oAddress) => RD.fromOption(oAddress, () => Error('Could not find pool address')))
        )
      )
    )

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
   * @param poolAddresses Pool address to validate
   * @param chain Chain of pool to validate
   */
  const validatePool$ = (poolAddresses: PoolAddress, chain: Chain): ValidatePoolLD =>
    FP.pipe(
      loadInboundAddresses$(),
      liveData.map((addresses) => getPoolAddressesByChain(addresses, chain)),
      liveData.chain((oAddresses) =>
        eqOPoolAddresses.equals(oAddresses, O.some(poolAddresses))
          ? Rx.of(RD.success(true))
          : // TODO (@veado) Add i18n
            Rx.of(
              RD.failure(
                Error(
                  `Pool address ${poolAddresses.address} ${FP.pipe(
                    poolAddresses.router,
                    O.map((poolAddress) => `and/or router address ${poolAddress} are not available`),
                    O.getOrElse(() => 'is not available')
                  )}`
                )
              )
            )
      ),
      liveData.mapLeft((error) => ({
        errorId: ErrorId.VALIDATE_POOL,
        msg: error?.message ?? error.toString()
      })),
      RxOp.catchError((error: Error) =>
        Rx.of(
          RD.failure({
            errorId: ErrorId.VALIDATE_POOL,
            msg: error?.message ?? error.toString()
          })
        )
      )
    )

  const { stream$: reloadPoolStatsDetail$, trigger: reloadPoolStatsDetail } = triggerStream()

  // Factory to get pool stats detail from Midgard
  const apiGetPoolStatsDetail$ = (request: GetPoolStatsRequest): PoolStatsDetailLD =>
    FP.pipe(
      Rx.combineLatest([midgardDefaultApi$, reloadPoolStatsDetail$]),
      RxOp.map(([api]) => api),
      liveData.chain((api) =>
        FP.pipe(
          api.getPoolStats(request),
          RxOp.map(RD.success),
          RxOp.startWith(RD.pending),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      ),
      RxOp.shareReplay(1)
    )

  const poolStatsDetail$ = (period?: GetPoolStatsPeriodEnum): PoolStatsDetailLD =>
    selectedPoolAsset$.pipe(
      RxOp.filter(O.isSome),
      RxOp.switchMap((selectedPoolAsset) =>
        FP.pipe(
          selectedPoolAsset,
          O.fold(
            () => Rx.of(RD.initial),
            (asset) =>
              apiGetPoolStatsDetail$({
                asset: assetToString(asset),
                period: period
              })
          )
        )
      ),
      RxOp.startWith(RD.pending),
      RxOp.shareReplay(1)
    )

  // Factory to get pool legacy detail from Midgard
  const apiGetPoolLegacyDetail$ = (request: GetPoolStatsLegacyRequest): PoolLegacyDetailLD =>
    FP.pipe(
      Rx.combineLatest([midgardDefaultApi$, reloadPoolStatsDetail$]),
      RxOp.map(([api]) => api),
      liveData.chain((api) =>
        FP.pipe(
          api.getPoolStatsLegacy(request),
          RxOp.map(RD.success),
          RxOp.startWith(RD.pending),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      ),
      RxOp.shareReplay(1)
    )

  const poolLegacyDetail$: PoolLegacyDetailLD = selectedPoolAsset$.pipe(
    RxOp.filter(O.isSome),
    RxOp.switchMap((selectedPoolAsset) =>
      FP.pipe(
        selectedPoolAsset,
        O.fold(
          () => Rx.of(RD.initial),
          (asset) =>
            apiGetPoolLegacyDetail$({
              asset: assetToString(asset)
            })
        )
      )
    ),
    RxOp.startWith(RD.pending),
    RxOp.shareReplay(1)
  )

  // Factory to get pool liquidity history from Midgard
  const apiGetPoolLiquidityHistory$ = (request: GetLiquidityHistoryRequest): PoolLiquidityHistoryLD =>
    FP.pipe(
      Rx.combineLatest([midgardDefaultApi$, reloadPoolStatsDetail$]),
      RxOp.map(([api]) => api),
      liveData.chain((api) =>
        FP.pipe(
          api.getLiquidityHistory(request),
          RxOp.map(RD.success),
          RxOp.startWith(RD.pending),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      ),
      RxOp.shareReplay(1)
    )

  const poolLiquidityHistory$ = (params: PoolLiquidityHistoryParams): PoolLiquidityHistoryLD =>
    selectedPoolAsset$.pipe(
      RxOp.filter(O.isSome),
      RxOp.switchMap((selectedPoolAsset) =>
        FP.pipe(
          selectedPoolAsset,
          O.fold(
            () => Rx.of(RD.initial),
            (asset) =>
              apiGetPoolLiquidityHistory$({
                pool: assetToString(asset),
                ...params
              })
          )
        )
      ),
      RxOp.startWith(RD.pending),
      RxOp.shareReplay(1)
    )

  return {
    poolsState$,
    pendingPoolsState$,
    allPoolDetails$,
    setSelectedPricePoolAsset,
    selectedPricePoolAsset$,
    selectedPricePool$,
    selectedPricePoolAssetSymbol$,
    reloadPools,
    reloadPendingPools,
    reloadAllPools,
    selectedPoolAddress$,
    poolAddressesByChain$,
    reloadPoolAddresses,
    selectedPoolDetail$,
    reloadSelectedPoolDetail: (delayTime = 0) => _reloadSelectedPoolDetail(delayTime),
    reloadPoolStatsDetail,
    poolStatsDetail$,
    poolLegacyDetail$,
    poolLiquidityHistory$,
    priceRatio$,
    availableAssets$,
    validatePool$,
    poolsFilters$,
    setPoolsFilter
  }
}

export { createPoolsService, getStoredSelectedPricePoolAsset as getSelectedPricePool }
