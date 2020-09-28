import * as RD from '@devexperts/remote-data-ts'
import midgard from '@thorchain/asgardex-midgard'
import { pipe } from 'fp-ts/pipeable'
import * as Rx from 'rxjs'
import { retry, catchError, map, shareReplay, startWith, switchMap, distinctUntilChanged } from 'rxjs/operators'

import { isEnv } from '../../helpers/envHelper'
import { fromPromise$ } from '../../helpers/rx/fromPromise'
import { liveData, LiveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import { Configuration, DefaultApi } from '../../types/generated/midgard'
import { network$ } from '../app/service'
import { Network } from '../app/types'
import { MIDGARD_MAX_RETRY } from '../const'
import { createPoolsService } from './pools'
import { createStakeService } from './stake'
import { NetworkInfoRD, NetworkInfoLD, ThorchainConstantsLD, ByzantineLD, ThorchainLastblockLD } from './types'

const BYZANTINE_MAX_RETRY = 5

const MIDGARD_TESTNET_URL = process.env.REACT_APP_MIDGARD_TESTNET_URL

/**
 * Helper to get `DefaultApi` instance for Midgard using custom basePath
 */
const getMidgardDefaultApi = (basePath: string) => new DefaultApi(new Configuration({ basePath }))

const nextByzantine$: (n: Network) => LiveData<Error, string> = fromPromise$<RD.RemoteData<Error, string>, Network>(
  (network: Network) => {
    // option to set Midgard url (for development only)
    if (network === 'testnet' && isEnv(MIDGARD_TESTNET_URL)) return Promise.resolve(RD.success(MIDGARD_TESTNET_URL))
    else return midgard(network, true).then(RD.success)
  },
  RD.pending,
  RD.failure
)

/**
 * Endpoint provided by Byzantine
 */
const byzantine$: ByzantineLD = network$.pipe(
  // Since `getNetworkState` is created by `observableState` and it takes an initial value,
  // this stream might emit same values and we do need a "dirty check"
  // to avoid to create another instance of byzantine by having same `Network`
  distinctUntilChanged(),
  switchMap(nextByzantine$),
  shareReplay(1),
  retry(BYZANTINE_MAX_RETRY)
)

/**
 * Get `ThorchainLastblock` data from Midgard
 */
const apiGetThorchainLastblock$ = byzantine$.pipe(
  liveData.chain((endpoint) =>
    pipe(
      getMidgardDefaultApi(endpoint).getThorchainProxiedLastblock(),
      map(RD.success),
      catchError((e: Error) => Rx.of(RD.failure(e)))
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
    catchError((error: Error) => Rx.of(RD.failure(error))),
    startWith(RD.pending),
    retry(MIDGARD_MAX_RETRY)
  )

/**
 * State of `ThorchainLastblock`, it will be loaded data by first subscription only
 */
const thorchainLastblockState$: ThorchainLastblockLD = reloadThorchainLastblock$.pipe(
  // start request
  switchMap((_) => loadThorchainLastblock$()),
  // cache it to avoid reloading data by every subscription
  shareReplay(1)
)

/**
 * Get `ThorchainConstants` data from Midgard
 */
const apiGetThorchainConstants$ = pipe(
  byzantine$,
  liveData.chain((endpoint) =>
    pipe(
      getMidgardDefaultApi(endpoint).getThorchainProxiedConstants(),
      map(RD.success),
      catchError((e: Error) => Rx.of(RD.failure(e)))
    )
  )
)

/**
 * Provides data of `ThorchainConstants`
 */
const thorchainConstantsState$: ThorchainConstantsLD = apiGetThorchainConstants$.pipe(
  startWith(RD.pending),
  retry(MIDGARD_MAX_RETRY),
  shareReplay(1)
)

/**
 * Loads data of `NetworkInfo`
 */
const loadNetworkInfo$ = (): Rx.Observable<NetworkInfoRD> =>
  pipe(
    byzantine$,
    liveData.chain((endpoint) =>
      pipe(
        getMidgardDefaultApi(endpoint).getNetworkData(),
        map(RD.success),
        startWith(RD.pending),
        catchError((e: Error) => Rx.of(RD.failure(e))),
        retry(MIDGARD_MAX_RETRY)
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
  switchMap(loadNetworkInfo$),
  // cache it to avoid reloading data by every subscription
  shareReplay(1)
)

export type MidgardService = {
  networkInfo$: NetworkInfoLD
  reloadNetworkInfo: () => void
  thorchainConstantsState$: ThorchainConstantsLD
  thorchainLastblockState$: ThorchainLastblockLD
  reloadThorchainLastblock: () => void
  apiEndpoint$: ByzantineLD
}
/**
 * Service object with all "public" functions and observables we want to provide
 */
export const service = {
  networkInfo$,
  reloadNetworkInfo,
  thorchainConstantsState$,
  thorchainLastblockState$,
  reloadThorchainLastblock,
  apiEndpoint$: byzantine$,
  pools: createPoolsService(byzantine$, getMidgardDefaultApi),
  stake: createStakeService(byzantine$, getMidgardDefaultApi)
}
