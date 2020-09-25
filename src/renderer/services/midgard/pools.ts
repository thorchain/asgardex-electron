import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetFromString, assetToString, bn, currencySymbolByAsset } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import { some } from 'fp-ts/Option'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import { combineLatest } from 'rxjs'
import { catchError, map, retry, shareReplay, startWith, switchMap, filter } from 'rxjs/operators'

import { isPricePoolAsset, ONE_BN, PRICE_POOLS_WHITELIST } from '../../const'
import { getRuneAsset } from '../../helpers/assetHelper'
import { LiveData, liveData } from '../../helpers/rx/liveData'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { DefaultApi, GetPoolsDetailsViewEnum } from '../../types/generated/midgard/apis'
import { PoolDetail } from '../../types/generated/midgard/models'
import { PricePoolAsset } from '../../views/pools/types'
import { network$ } from '../app/service'
import { MIDGARD_MAX_RETRY } from '../const'
import { PoolDetailLD, PoolsService, PoolsStateLD, SelectedPricePoolAsset, ThorchainEndpointsLD } from './types'
import { getPricePools, pricePoolSelector } from './utils'

const PRICE_POOL_KEY = 'asgdx-price-pool'

const getSelectedPricePool = (): O.Option<Asset> =>
  FP.pipe(localStorage.getItem(PRICE_POOL_KEY) as string, assetFromString, O.fromNullable, O.filter(isPricePoolAsset))

const runeAsset$: Rx.Observable<Asset> = network$.pipe(map((network) => getRuneAsset({ network, chain: 'BNB' })))

const createPoolsService = (
  byzantine$: LiveData<Error, string>,
  getMidgardDefaultApi: (basePath: string) => DefaultApi
): PoolsService => {
  /**
   * Get data of `Pools` from Midgard
   */
  const apiGetPools$ = byzantine$.pipe(
    map(RD.map(getMidgardDefaultApi)),
    liveData.chain((api) =>
      FP.pipe(
        api.getPools(),
        map(RD.success),
        catchError((e: Error) => Rx.of(RD.failure(e)))
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
          map(RD.success),
          catchError((e: Error) => Rx.of(RD.failure(e)))
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
          map(RD.success),
          catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      )
    )

  /**
   * Loading queue to get all needed data for `PoolsState`
   */
  const loadPoolsStateData$ = (): PoolsStateLD => {
    const poolAssets$ = FP.pipe(apiGetPools$, shareReplay(1))

    const assetDetails$ = FP.pipe(
      poolAssets$,
      liveData.map((assets) => assets.join(',')),
      liveData.chain(apiGetAssetInfo$),
      shareReplay(1)
    )

    const poolDetails$ = FP.pipe(
      poolAssets$,
      liveData.map((assets) => assets.join(',')),
      liveData.chain(apiGetPoolsData$),
      shareReplay(1)
    )

    const pricePools$ = combineLatest([poolDetails$, runeAsset$]).pipe(
      map(([poolDetailsRD, runeAsset]) =>
        FP.pipe(
          poolDetailsRD,
          RD.map((poolDetails) => some(getPricePools(poolDetails, runeAsset, PRICE_POOLS_WHITELIST)))
        )
      ),
      shareReplay(1)
    )

    return FP.pipe(
      combineLatest([poolAssets$, assetDetails$, poolDetails$, pricePools$]),
      map((state) => RD.combine(...state)),
      map(
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
      startWith(RD.pending),
      catchError((error: Error) => Rx.of(RD.failure(error))),
      retry(MIDGARD_MAX_RETRY)
    )
  }

  // `TriggerStream` to reload data of pools
  const { stream$: reloadPoolsState$, trigger: reloadPoolsState } = triggerStream()

  /**
   * State of all pool data
   */
  const poolsState$: PoolsStateLD = reloadPoolsState$.pipe(
    // start loading queue
    switchMap(loadPoolsStateData$),
    // cache it to avoid reloading data by every subscription
    shareReplay(1)
  )

  // `TriggerStream` to reload detailed data of pool
  const { get$: reloadPoolDetailedState$, set: reloadPoolDetailedState } = observableState<O.Option<Asset>>(O.none)

  const poolDetailedState$: PoolDetailLD = reloadPoolDetailedState$.pipe(
    filter(O.isSome),
    switchMap((asset) => apiGetPoolsData$(assetToString(asset.value), true)),
    liveData.chain(
      FP.flow(
        A.head,
        liveData.fromOption(() => Error('Empty response'))
      )
    ),
    startWith(RD.pending),
    shareReplay(1)
  )

  const {
    get: getSelectedPricePoolAsset,
    get$: getSelectedPricePoolAsset$,
    set: updateSelectedPricePoolAsset
  } = observableState<SelectedPricePoolAsset>(getSelectedPricePool())

  /**
   * Selected PricePoolAsset
   * which is RUNE asset by default
   */
  const selectedPricePoolAsset$ = combineLatest([getSelectedPricePoolAsset$, runeAsset$]).pipe(
    map(([oPricePoolAsset, runeAsset]) =>
      FP.pipe(
        oPricePoolAsset,
        O.getOrElse(() => runeAsset)
      )
    )
  )

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
  const selectedPricePoolAssetSymbol$: Rx.Observable<string> = FP.pipe(
    selectedPricePoolAsset$,
    map(currencySymbolByAsset)
  )

  const poolAddresses$: ThorchainEndpointsLD = FP.pipe(
    byzantine$,
    liveData.chain((endpoint) =>
      FP.pipe(
        getMidgardDefaultApi(endpoint).getThorchainProxiedEndpoints(),
        map(RD.success),
        startWith(RD.pending),
        catchError((e: Error) => Rx.of(RD.failure(e)))
      )
    ),
    liveData.map((s) => s.current || []),
    retry(MIDGARD_MAX_RETRY)
  )

  /**
   * Use this to convert asset's price to selected price asset by multiplying to the priceRation inner value
   */
  const priceRatio$: Rx.Observable<BigNumber> = FP.pipe(
    combineLatest([FP.pipe(poolsState$, map(RD.toOption)), selectedPricePoolAsset$]),
    map(([oPools, selectedAsset]) =>
      FP.pipe(
        oPools,
        O.chain((pools) =>
          FP.pipe(
            pools.assetDetails,
            A.findFirst((assetDetail) => assetFromString(assetDetail?.asset ?? '') === selectedAsset)
          )
        )
      )
    ),
    map(O.map((detail) => ONE_BN.dividedBy(bn(detail.priceRune || 1)))),
    map(O.getOrElse(() => ONE_BN))
  )

  return {
    poolsState$,
    setSelectedPricePool: setSelectedPricePoolAsset,
    selectedPricePoolAsset$,
    selectedPricePoolAssetSymbol$,
    reloadPoolsState,
    poolAddresses$,
    runeAsset$,
    poolDetailedState$,
    reloadPoolDetailedState,
    priceRatio$
  }
}

export { runeAsset$, createPoolsService, getSelectedPricePool }
