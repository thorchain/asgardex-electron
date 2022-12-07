import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ApiUrls, Network } from '../../../shared/api/types'
import { ASGARDEX_IDENTIFIER } from '../../../shared/const'
import { DEFAULT_MIDGARD_URLS } from '../../../shared/midgard/const'
import { eqApiUrls } from '../../helpers/fp/eq'
import { liveData } from '../../helpers/rx/liveData'
import { triggerStream, TriggerStream$ } from '../../helpers/stateHelper'
import { Configuration, DefaultApi, Middleware, RequestArgs } from '../../types/generated/midgard'
import { network$ } from '../app/service'
import { MIDGARD_MAX_RETRY } from '../const'
import { getStorageState$, modifyStorage, getStorageState } from '../storage/common'
import { inboundAddressesShared$, loadInboundAddresses$ } from '../thorchain/'
import { ErrorId } from '../wallet/types'
import { createActionsService } from './actions'
import { selectedPoolAsset$, setSelectedPoolAsset } from './common'
import { createPoolsService } from './pools'
import { createSharesService } from './shares'
import {
  NetworkInfoRD,
  NetworkInfoLD,
  MidgardUrlLD,
  HealthLD,
  ValidateNodeLD,
  CheckMidgardUrlHandler,
  SelectedPoolAsset,
  MidgardStatusLD
} from './types'

// `TriggerStream` to reload Midgard
const { stream$: reloadMidgardUrl$, trigger: reloadMidgardUrl } = triggerStream()

/**
 * Stream of Midgard urls (from storage)
 */
const getMidgardUrl$ = FP.pipe(
  Rx.combineLatest([getStorageState$, reloadMidgardUrl$]),
  RxOp.map(([storage]) =>
    FP.pipe(
      storage,
      O.map(({ midgard: midgardUrls }) => midgardUrls),
      O.getOrElse(() => DEFAULT_MIDGARD_URLS)
    )
  ),
  RxOp.distinctUntilChanged(eqApiUrls.equals)
)

/**
 * Current value of Midgard urls (from storage)
 */
const getMidgardUrl = (): ApiUrls =>
  FP.pipe(
    getStorageState(),
    O.map(({ midgard: midgardUrls }) => midgardUrls),
    O.getOrElse(() => DEFAULT_MIDGARD_URLS)
  )

/**
 * Updates Midgard url and stores it persistantly
 */
const setMidgardUrl = (url: string, network: Network) => {
  const midgardUrls = { ...getMidgardUrl(), [network]: url }
  modifyStorage(O.some({ midgard: midgardUrls }))
}

const MIDGARD_API_MIDDLEWARE: Middleware = {
  pre: (req: RequestArgs) => {
    const headers = req?.headers ?? {}
    return { ...req, headers: { ...headers, 'x-client-id': `${ASGARDEX_IDENTIFIER}` } }
  }
}

/**
 * Helper to get `DefaultApi` instance for Midgard using custom basePath
 */
const getMidgardDefaultApi = (basePath: string) =>
  new DefaultApi(
    new Configuration({
      basePath,
      middleware: [MIDGARD_API_MIDDLEWARE]
    })
  )
/**
 * Midgard url
 */
const midgardUrl$: MidgardUrlLD = Rx.combineLatest([network$, getMidgardUrl$]).pipe(
  RxOp.map(([network, midgardUrl]) => RD.success(midgardUrl[network])),
  RxOp.shareReplay(1)
)

/**
 * Loads data of `NetworkInfo`
 */
const loadNetworkInfo$ = (): Rx.Observable<NetworkInfoRD> =>
  FP.pipe(
    midgardUrl$,
    liveData.chain((endpoint) =>
      FP.pipe(
        getMidgardDefaultApi(endpoint).getNetworkData(),
        RxOp.map(RD.success),
        RxOp.startWith(RD.pending),
        RxOp.catchError((e: Error) => Rx.of(RD.failure(e))),
        RxOp.retry(MIDGARD_MAX_RETRY)
      )
    )
  )

// `TriggerStream` to reload `NetworkInfo`
const { stream$: reloadNetworkInfo$, trigger: reloadNetworkInfo } = triggerStream()

/**
 * State of `NetworkInfo`, it will be loaded data by first subscription only
 */
const networkInfo$: NetworkInfoLD = reloadNetworkInfo$.pipe(
  // start request
  RxOp.switchMap(loadNetworkInfo$),
  // cache it to avoid reloading data by every subscription
  RxOp.shareReplay(1)
)

const health$: HealthLD = FP.pipe(
  midgardUrl$,
  liveData.chain((endpoint) =>
    FP.pipe(
      getMidgardDefaultApi(endpoint).getHealth(),
      RxOp.map(RD.success),
      RxOp.startWith(RD.pending),
      RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
    )
  )
)

const validateNode$ = (): ValidateNodeLD =>
  health$.pipe(
    liveData.map((_) => true),
    liveData.mapLeft((error) => ({
      errorId: ErrorId.VALIDATE_NODE,
      msg: error?.message ?? error.toString()
    })),
    RxOp.startWith(RD.initial)
  )

// `TriggerStream` to reload chart data handled on view (not service) level only
export const { stream$: reloadChartDataUI$, trigger: reloadChartDataUI } = triggerStream()

export const checkMidgardUrl$: CheckMidgardUrlHandler = (url, intl) =>
  FP.pipe(
    getMidgardDefaultApi(url).getHealth(),
    RxOp.map((result) => {
      const { database, inSync } = result
      if (database && inSync) return RD.success(url)

      return RD.failure(
        Error(
          intl?.formatMessage({ id: 'midgard.url.error.unhealthy' }, { endpoint: '/health' }) || 'Midgard is unhealthy'
        )
      )
    }),
    RxOp.catchError((_: Error) =>
      Rx.of(
        RD.failure(Error(`${intl?.formatMessage({ id: 'midgard.url.error.invalid' })} || 'Midgard can't be accessed'`))
      )
    )
  )

const healthInterval$ = Rx.timer(0 /* no delay for first value */, 5 * 60 * 1000 /* others are delayed by 5 min  */)

const healthStatus$: MidgardStatusLD = FP.pipe(
  Rx.combineLatest([midgardUrl$, healthInterval$]),
  RxOp.map(([urlRD, _]) => urlRD),
  liveData.chain((url) => checkMidgardUrl$(url)),
  liveData.map((_) => true)
)

export type MidgardService = {
  networkInfo$: NetworkInfoLD
  reloadNetworkInfo: FP.Lazy<void>
  setSelectedPoolAsset: (p: SelectedPoolAsset) => void
  selectedPoolAsset$: Rx.Observable<SelectedPoolAsset>
  reloadChartDataUI: FP.Lazy<void>
  reloadChartDataUI$: TriggerStream$
  apiEndpoint$: MidgardUrlLD
  reloadApiEndpoint: FP.Lazy<void>
  setMidgardUrl: (url: string, network: Network) => void
  checkMidgardUrl$: CheckMidgardUrlHandler
  pools: ReturnType<typeof createPoolsService>
  shares: ReturnType<typeof createSharesService>
  actions: ReturnType<typeof createActionsService>
  healthStatus$: MidgardStatusLD
  validateNode$: () => ValidateNodeLD
}
/**
 * Service object with all "public" functions and observables we want to provide
 */
export const service: MidgardService = {
  networkInfo$,
  reloadNetworkInfo,
  reloadChartDataUI,
  reloadChartDataUI$,
  setSelectedPoolAsset,
  selectedPoolAsset$,
  apiEndpoint$: midgardUrl$,
  reloadApiEndpoint: reloadMidgardUrl,
  setMidgardUrl,
  checkMidgardUrl$,
  healthStatus$,
  validateNode$,
  pools: createPoolsService({
    midgardUrl$,
    getMidgardDefaultApi,
    selectedPoolAsset$,
    loadInboundAddresses$,
    inboundAddressesShared$
  }),
  shares: createSharesService(midgardUrl$, getMidgardDefaultApi),
  actions: createActionsService(midgardUrl$, getMidgardDefaultApi)
}
