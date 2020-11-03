import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetFromString, assetToString, bn, currencySymbolByAsset, isValidAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import { some } from 'fp-ts/Option'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import { combineLatest } from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ONE_BN, PRICE_POOLS_WHITELIST } from '../../const'
import { getRuneAsset, isPricePoolAsset } from '../../helpers/assetHelper'
import { eqAsset } from '../../helpers/fp/eq'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { LiveData, liveData } from '../../helpers/rx/liveData'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { DefaultApi, GetPoolsDetailsViewEnum } from '../../types/generated/midgard/apis'
import { PoolDetail } from '../../types/generated/midgard/models'
import { PricePool, PricePoolAsset, PricePools } from '../../views/pools/Pools.types'
import { network$ } from '../app/service'
import { MIDGARD_MAX_RETRY } from '../const'
import {
  AssetDetailsLD,
  PoolStringAssetsLD,
  PoolDetailLD,
  PoolDetailsLD,
  PoolsService,
  PoolsStateLD,
  SelectedPricePoolAsset,
  ThorchainEndpointsLD,
  PoolAssetsLD
} from './types'
import { getPricePools, pricePoolSelector, pricePoolSelectorFromRD } from './utils'

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
  /**
   * Get data of `Pools` from Midgard
   */
  const apiGetPools$ = byzantine$.pipe(
    RxOp.map(RD.map(getMidgardDefaultApi)),
    liveData.chain((api) =>
      FP.pipe(
        api.getPools(),
        RxOp.map(RD.success),
        RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
      )
    )
  )

  /**
   * Get data of `AssetDetails` from Midgard
   */
  const apiGetAssetInfo$ = (asset: string) =>
    FP.pipe(
      byzantine$,
      liveData.chain((endpoint) =>
        FP.pipe(
          getMidgardDefaultApi(endpoint).getAssetInfo({ asset }),
          RxOp.map(RD.success),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      )
    )

  /**
   * Get `PoolDetails` data from Midgard
   */
  const apiGetPoolsData$ = (asset: string, isDetailed = false): LiveData<Error, PoolDetail[]> =>
    byzantine$.pipe(
      liveData.chain((endpoint) =>
        FP.pipe(
          getMidgardDefaultApi(endpoint).getPoolsDetails({
            asset,
            view: isDetailed ? GetPoolsDetailsViewEnum.Full : GetPoolsDetailsViewEnum.Simple
          }),
          // error if no pools are available
          RxOp.map((assets) => (assets.length > 0 ? RD.success(assets) : RD.failure(new Error('No pools available')))),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      )
    )

  /**
   * Loading queue to get all needed data for `PoolsState`
   */
  const loadPoolsStateData$ = (): PoolsStateLD => {
    const poolAssets$: PoolStringAssetsLD = FP.pipe(apiGetPools$, RxOp.shareReplay(1))

    const assetDetails$: AssetDetailsLD = FP.pipe(
      poolAssets$,
      liveData.map((assets) => assets.join(',')),
      liveData.chain(apiGetAssetInfo$),
      RxOp.shareReplay(1)
    )

    const poolDetails$: PoolDetailsLD = FP.pipe(
      poolAssets$,
      liveData.map((assets) => assets.join(',')),
      liveData.chain(apiGetPoolsData$),
      RxOp.shareReplay(1)
    )

    const pricePools$: LiveData<Error, O.Option<PricePools>> = combineLatest([poolDetails$, runeAsset$]).pipe(
      RxOp.map(([poolDetailsRD, runeAsset]) =>
        FP.pipe(
          poolDetailsRD,
          RD.map((poolDetails) => some(getPricePools(poolDetails, runeAsset, PRICE_POOLS_WHITELIST)))
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

  // `TriggerStream` to reload data of pools
  const { stream$: reloadPools$, trigger: reloadPools } = triggerStream()

  /**
   * State of all pool data
   */
  const poolsState$: PoolsStateLD = reloadPools$.pipe(
    // start loading queue
    RxOp.switchMap(loadPoolsStateData$),
    // cache it to avoid reloading data by every subscription
    RxOp.shareReplay(1)
  )

  // `TriggerStream` to reload detailed data of pool
  const { stream$: reloadPoolDetail$, trigger: reloadPoolDetail } = triggerStream()

  /**
   * Stream of `PoolDetail` data
   * It's triggered by changes of `reloadPoolDetail$` or `selectedPoolAsset$`
   */
  const poolDetail$: PoolDetailLD = combineLatest([reloadPoolDetail$, selectedPoolAsset$]).pipe(
    RxOp.filter(([_, selectedPoolAsset]) => O.isSome(selectedPoolAsset)),
    RxOp.switchMap(([_, selectedPoolAsset]) =>
      FP.pipe(
        selectedPoolAsset,
        O.fold(
          () => Rx.of(RD.initial),
          (asset) => apiGetPoolsData$(assetToString(asset), true)
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
  const selectedPricePool$: Rx.Observable<PricePool> = combineLatest([
    runeAsset$,
    poolsState$,
    selectedPricePoolAsset$
  ]).pipe(
    RxOp.map(([runeAsset, poolsState, selectedPricePoolAsset]) =>
      pricePoolSelectorFromRD(poolsState, selectedPricePoolAsset, runeAsset)
    )
  )

  const poolAddresses$: ThorchainEndpointsLD = FP.pipe(
    byzantine$,
    liveData.chain((endpoint) =>
      FP.pipe(
        getMidgardDefaultApi(endpoint).getThorchainProxiedEndpoints(),
        RxOp.map(RD.success),
        RxOp.startWith(RD.pending),
        RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
      )
    ),
    liveData.map((s) => s.current || []),
    RxOp.retry(MIDGARD_MAX_RETRY)
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
    setSelectedPricePoolAsset,
    selectedPricePoolAsset$,
    selectedPricePool$,
    selectedPricePoolAssetSymbol$,
    reloadPools,
    poolAddresses$,
    runeAsset$,
    poolDetail$,
    reloadPoolDetail,
    priceRatio$,
    availableAssets$
  }
}

export { runeAsset$, createPoolsService, getStoredSelectedPricePoolAsset as getSelectedPricePool }
