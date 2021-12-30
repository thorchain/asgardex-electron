import * as RD from '@devexperts/remote-data-ts'
// Byzantine module is disabled temporary
// import midgard from '@thorchain/asgardex-midgard'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { envOrDefault } from '../../../shared/utils/env'
import { THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { fromPromise$ } from '../../helpers/rx/fromPromise'
import { liveData, LiveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
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
  ByzantineLD,
  ThorchainLastblockLD,
  NativeFeeLD,
  HealthLD,
  ValidateNodeLD
} from './types'

const MIDGARD_TESTNET_URL = envOrDefault(
  process.env.REACT_APP_MIDGARD_TESTNET_URL,
  'https://testnet.midgard.thorchain.info'
)

const MIDGARD_STAGENET_URL = envOrDefault(
  process.env.REACT_APP_MIDGARD_STAGENET_URL,
  'https://stagenet-midgard.ninerealms.com'
)

const MIDGARD_MAINNET_URL = envOrDefault(process.env.REACT_APP_MIDGARD_MAINNET_URL, 'https://midgard.thorchain.info')

/**
 * Helper to get `DefaultApi` instance for Midgard using custom basePath
 */
const getMidgardDefaultApi = (basePath: string) => new DefaultApi(new Configuration({ basePath }))

// `TriggerStream` to reload Byzantine
const { stream$: reloadByzantine$, trigger: reloadByzantine } = triggerStream()

const nextByzantine$: (n: Network) => LiveData<Error, string> = fromPromise$<RD.RemoteData<Error, string>, Network>(
  (network: Network) => {
    // option to set Midgard url (for testnet + development only)
    let midgardURL
    switch (network) {
      case 'mainnet':
        midgardURL = MIDGARD_MAINNET_URL
        break
      case 'stagenet':
        midgardURL = MIDGARD_STAGENET_URL
        break
      case 'testnet':
        midgardURL = MIDGARD_TESTNET_URL
        break
    }

    // Byzantine module is disabled temporary
    // return midgard(network, true).then(RD.success)
    return Promise.resolve(RD.success(midgardURL))
  },
  RD.pending,
  RD.failure
)

/**
 * Endpoint provided by Byzantine
 */
const byzantine$: ByzantineLD = Rx.combineLatest([network$, reloadByzantine$]).pipe(
  RxOp.switchMap(([network]) => nextByzantine$(network)),
  RxOp.shareReplay(1)
)

/**
 * Get `ThorchainLastblock` data from Midgard
 */
const apiGetThorchainLastblock$ = byzantine$.pipe(
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

/**
 * State of `ThorchainLastblock`, it will be loaded data by first subscription only
 */
const thorchainLastblockState$: ThorchainLastblockLD = reloadThorchainLastblock$.pipe(
  // start request
  RxOp.switchMap((_) => loadThorchainLastblock$()),
  // cache it to avoid reloading data by every subscription
  RxOp.shareReplay(1)
)

/**
 * Get `ThorchainConstants` data from Midgard
 */
const apiGetThorchainConstants$ = FP.pipe(
  byzantine$,
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
    byzantine$,
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
  byzantine$,
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

export type MidgardService = {
  networkInfo$: NetworkInfoLD
  reloadNetworkInfo: () => void
  thorchainConstantsState$: ThorchainConstantsLD
  thorchainLastblockState$: ThorchainLastblockLD
  nativeTxFee$: NativeFeeLD
  reloadThorchainLastblock: () => void
  setSelectedPoolAsset: () => void
  apiEndpoint$: ByzantineLD
  getTransactionState$: (txId: string) => LiveData<Error, O.Option<string>>
  validateNode$: () => ValidateNodeLD
}
/**
 * Service object with all "public" functions and observables we want to provide
 */
export const service = {
  networkInfo$,
  reloadNetworkInfo,
  reloadThorchainConstants,
  thorchainConstantsState$,
  thorchainLastblockState$,
  nativeTxFee$,
  reloadThorchainLastblock,
  setSelectedPoolAsset,
  selectedPoolAsset$,
  apiEndpoint$: byzantine$,
  reloadApiEndpoint: reloadByzantine,
  pools: createPoolsService(byzantine$, getMidgardDefaultApi, selectedPoolAsset$),
  shares: createSharesService(byzantine$, getMidgardDefaultApi),
  validateNode$,
  actions: createActionsService(byzantine$, getMidgardDefaultApi)
}
