import * as RD from '@devexperts/remote-data-ts'
// Byzantine module is disabled temporary
// import midgard from '@thorchain/asgardex-midgard'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { IntlShape } from 'react-intl'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { envOrDefault } from '../../../shared/utils/env'
import { THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { liveData } from '../../helpers/rx/liveData'
import { observableState, triggerStream, TriggerStream$ } from '../../helpers/stateHelper'
import { Configuration, DefaultApi } from '../../types/generated/midgard'
import { network$ } from '../app/service'
import { MIDGARD_MAX_RETRY } from '../const'
import { ErrorId } from '../wallet/types'
import { createActionsService } from './actions'
import { selectedPoolAsset$, setSelectedPoolAsset } from './common'
import { createPoolsService } from './pools'
import { createSharesService } from './shares'
import {
  NetworkInfoRD,
  NetworkInfoLD,
  ThorchainConstantsLD,
  MidgardUrlLD,
  ThorchainLastblockLD,
  NativeFeeLD,
  HealthLD,
  ValidateNodeLD,
  CheckMidgardUrlHandler,
  SelectedPoolAsset
} from './types'

const MIDGARD_TESTNET_URL = envOrDefault(
  process.env.REACT_APP_MIDGARD_TESTNET_URL,
  'https://testnet.midgard.thorchain.info'
)

const MIDGARD_STAGENET_URL = envOrDefault(
  process.env.REACT_APP_MIDGARD_STAGENET_URL,
  'https://stagenet-midgard.ninerealms.com'
)

const MIDGARD_MAINNET_URL = envOrDefault(process.env.REACT_APP_MIDGARD_MAINNET_URL, 'https://midgard.ninerealms.com')

// `TriggerStream` to reload Midgard
const { stream$: reloadMidgardUrl$, trigger: reloadMidgardUrl } = triggerStream()

const {
  get$: getMidgardUrl$,
  get: getMidgardUrl,
  set: _setMidgardUrl
} = observableState<Record<Network, string>>({
  mainnet: MIDGARD_MAINNET_URL,
  stagenet: MIDGARD_STAGENET_URL,
  testnet: MIDGARD_TESTNET_URL
})

const setMidgardUrl = (url: string, network: Network) => {
  const current = getMidgardUrl()
  _setMidgardUrl({ ...current, [network]: url })
}

/**
 * Helper to get `DefaultApi` instance for Midgard using custom basePath
 */
const getMidgardDefaultApi = (basePath: string) => new DefaultApi(new Configuration({ basePath }))

/**
 * Midgard endpoint
 */
const midgardUrl$: MidgardUrlLD = Rx.combineLatest([network$, getMidgardUrl$, reloadMidgardUrl$]).pipe(
  RxOp.map(([network, midgardUrl, _]) => RD.success(midgardUrl[network])),
  RxOp.shareReplay(1)
)

/**
 * Get `ThorchainLastblock` data from Midgard
 */
const apiGetThorchainLastblock$ = midgardUrl$.pipe(
  liveData.chain((endpoint) =>
    FP.pipe(
      getMidgardDefaultApi(endpoint).getProxiedLastblock(),
      RxOp.map(RD.success),
      RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
    )
  )
)

// `TriggerStream` to reload data of `ThorchainLastblock`
const { stream$: reloadThorchainLastblock$, trigger: reloadThorchainLastblock } = triggerStream()

/**
 * Loads data of `ThorchainLastblock`
 */
const loadThorchainLastblock$ = () =>
  apiGetThorchainLastblock$.pipe(
    // catch any errors if there any
    RxOp.catchError((error: Error) => Rx.of(RD.failure(error))),
    RxOp.startWith(RD.pending),
    RxOp.retry(MIDGARD_MAX_RETRY)
  )

const loadThorchainLastblockInterval$ = Rx.timer(0 /* no delay for first value */, 15 * 1000 /* every 15 sec  */)

/**
 * State of `ThorchainLastblock`, it will be loaded data by first subscription only
 */
const thorchainLastblockState$: ThorchainLastblockLD = FP.pipe(
  Rx.combineLatest([reloadThorchainLastblock$, loadThorchainLastblockInterval$]),
  // start request
  RxOp.switchMap((_) => loadThorchainLastblock$()),
  // cache it to avoid reloading data by every subscription
  RxOp.shareReplay(1)
)

/**
 * Get `ThorchainConstants` data from Midgard
 */
const apiGetThorchainConstants$ = FP.pipe(
  midgardUrl$,
  liveData.chain((endpoint) =>
    FP.pipe(
      getMidgardDefaultApi(endpoint).getProxiedConstants(),
      RxOp.map(RD.success),
      RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
    )
  )
)

const { stream$: reloadThorchainConstants$, trigger: reloadThorchainConstants } = triggerStream()

/**
 * Provides data of `ThorchainConstants`
 */
const thorchainConstantsState$: ThorchainConstantsLD = FP.pipe(
  reloadThorchainConstants$,
  RxOp.debounceTime(300),
  RxOp.switchMap(() => apiGetThorchainConstants$),
  RxOp.startWith(RD.pending),
  RxOp.retry(MIDGARD_MAX_RETRY),
  RxOp.shareReplay(1),
  RxOp.catchError(() => Rx.of(RD.failure(Error('Failed to load Thorchain constants'))))
)

const nativeTxFee$: NativeFeeLD = thorchainConstantsState$.pipe(
  liveData.map((constants) =>
    FP.pipe(
      O.fromNullable(constants.int_64_values?.NativeTransactionFee),
      O.map((value) => baseAmount(value, THORCHAIN_DECIMAL))
    )
  )
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

export const checkMidgardUrl$: CheckMidgardUrlHandler = (url: string, intl: IntlShape) =>
  FP.pipe(
    getMidgardDefaultApi(url).getHealth(),
    RxOp.map((result) => {
      const { database, inSync } = result
      if (database && inSync) return RD.success(url)

      return RD.failure(Error(intl.formatMessage({ id: 'midgard.url.error.unhealthy' }, { endpoint: '/health' })))
    }),
    RxOp.catchError((_: Error) =>
      Rx.of(RD.failure(Error(`${intl.formatMessage({ id: 'midgard.url.error.invalid' })}`)))
    )
  )

export type MidgardService = {
  networkInfo$: NetworkInfoLD
  reloadNetworkInfo: FP.Lazy<void>
  reloadThorchainConstants: FP.Lazy<void>
  thorchainConstantsState$: ThorchainConstantsLD
  thorchainLastblockState$: ThorchainLastblockLD
  nativeTxFee$: NativeFeeLD
  reloadThorchainLastblock: FP.Lazy<void>
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
  validateNode$: () => ValidateNodeLD
}
/**
 * Service object with all "public" functions and observables we want to provide
 */
export const service: MidgardService = {
  networkInfo$,
  reloadNetworkInfo,
  reloadThorchainConstants,
  thorchainConstantsState$,
  thorchainLastblockState$,
  nativeTxFee$,
  reloadThorchainLastblock,
  reloadChartDataUI,
  reloadChartDataUI$,
  setSelectedPoolAsset,
  selectedPoolAsset$,
  apiEndpoint$: midgardUrl$,
  reloadApiEndpoint: reloadMidgardUrl,
  setMidgardUrl,
  checkMidgardUrl$,
  validateNode$,
  pools: createPoolsService(midgardUrl$, getMidgardDefaultApi, selectedPoolAsset$),
  shares: createSharesService(midgardUrl$, getMidgardDefaultApi),
  actions: createActionsService(midgardUrl$, getMidgardDefaultApi)
}
