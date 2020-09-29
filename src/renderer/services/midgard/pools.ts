import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString, bn } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import { some } from 'fp-ts/Option'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/pipeable'
import * as Rx from 'rxjs'
import { combineLatest } from 'rxjs'
import { catchError, map, retry, shareReplay, startWith, switchMap, filter } from 'rxjs/operators'

import { ONE_BN, PRICE_POOLS_WHITELIST } from '../../const'
import { getCurrencySymbolByAssetString } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { LiveData, liveData } from '../../helpers/rx/liveData'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { DefaultApi, GetPoolsDetailsViewEnum } from '../../types/generated/midgard/apis'
import { PoolDetail } from '../../types/generated/midgard/models'
import { isPricePoolAsset, PricePoolAsset, RUNEAsset } from '../../views/pools/types'
import { getCurrentNetworkState, network$ } from '../app/service'
import { mapNetworkToPoolAssets, MIDGARD_MAX_RETRY } from '../const'
import { PoolsStateRD, SelectedPricePoolAsset } from './types'
import { getPricePools, pricePoolSelector } from './utils'

const PRICE_POOL_KEY = 'asgdx-price-pool'

const getSelectedPricePool = () =>
  FP.pipe(localStorage.getItem(PRICE_POOL_KEY), O.fromNullable, O.filter(isPricePoolAsset))

const networkPools$ = pipe(network$, map(mapNetworkToPoolAssets))

const getDefaultRuneAsset = (): RUNEAsset => mapNetworkToPoolAssets(getCurrentNetworkState()).RUNE

const runeAsset$ = pipe(
  networkPools$,
  map((pool) => pool.RUNE)
)

const createPoolsService = (
  byzantine$: LiveData<Error, string>,
  getMidgardDefaultApi: (basePath: string) => DefaultApi
) => {
  /**
   * Get data of `Pools` from Midgard
   */
  const apiGetPools$ = byzantine$.pipe(
    map(RD.map(getMidgardDefaultApi)),
    liveData.chain((api) =>
      pipe(
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
    pipe(
      byzantine$,
      liveData.chain((endpoint) =>
        pipe(
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
        pipe(
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
  const loadPoolsStateData$ = (): Rx.Observable<PoolsStateRD> => {
    const poolAssets$ = pipe(apiGetPools$, shareReplay(1))

    const assetDetails$ = pipe(
      poolAssets$,
      liveData.map((assets) => assets.join(',')),
      liveData.chain(apiGetAssetInfo$),
      shareReplay(1)
    )

    const poolDetails$ = pipe(
      poolAssets$,
      liveData.map((assets) => assets.join(',')),
      liveData.chain(apiGetPoolsData$),
      shareReplay(1)
    )

    const pricePools$ = pipe(
      poolDetails$,
      liveData.map((poolDetails) => some(getPricePools(poolDetails, PRICE_POOLS_WHITELIST))),
      shareReplay(1)
    )

    return pipe(
      combineLatest([poolAssets$, assetDetails$, poolDetails$, pricePools$]),
      map((state) => RD.combine(...state)),
      map(
        RD.map(([poolAssets, assetDetails, poolDetails, pricePools]) => {
          const prevAsset = selectedPricePoolAsset()
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
  const poolsState$: Rx.Observable<PoolsStateRD> = reloadPoolsState$.pipe(
    // start loading queue
    switchMap(loadPoolsStateData$),
    // cache it to avoid reloading data by every subscription
    shareReplay(1)
  )

  // `TriggerStream` to reload detailed data of pool
  const { get$: reloadPoolDetailedState$, set: reloadPoolDetailedState } = observableState<O.Option<Asset>>(O.none)

  const poolDetailedState$: LiveData<Error, PoolDetail> = reloadPoolDetailedState$.pipe(
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
    get$: selectedPricePoolAsset$,
    get: selectedPricePoolAsset,
    set: updateSelectedPricePoolAsset
  } = observableState<SelectedPricePoolAsset>(getSelectedPricePool())

  /**
   * Update selected `PricePoolAsset`
   */
  const setSelectedPricePoolAsset = (asset: PricePoolAsset) => {
    localStorage.setItem(PRICE_POOL_KEY, asset)
    updateSelectedPricePoolAsset(some(asset))
  }

  /**
   * Selected currency symbol
   */
  const selectedPricePoolAssetSymbol$ = FP.pipe(
    selectedPricePoolAsset$,
    map(
      FP.flow(
        O.map(getCurrencySymbolByAssetString),
        O.getOrElse(() => '')
      )
    )
  )

  const poolAddresses$ = pipe(
    byzantine$,
    liveData.chain((endpoint) =>
      pipe(
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
  const priceRatio$: Rx.Observable<BigNumber> = pipe(
    combineLatest([pipe(poolsState$, map(RD.toOption)), selectedPricePoolAsset$]),
    map(([pools, selectedAsset]) => sequenceTOption(pools, selectedAsset)),
    map(
      O.chain(([pools, selectedAsset]) =>
        pipe(
          pools.assetDetails,
          A.findFirst((s) => s.asset === selectedAsset)
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
    getDefaultRuneAsset,
    poolDetailedState$,
    reloadPoolDetailedState,
    priceRatio$
  }
}

export { runeAsset$, createPoolsService, getDefaultRuneAsset, getSelectedPricePool }
