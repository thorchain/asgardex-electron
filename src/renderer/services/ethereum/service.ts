import * as RD from '@devexperts/remote-data-ts'
import { Client as EthereumClient, Network as EthereumNetwork, Address } from '@thorchain/asgardex-ethereum'
import { AssetETH, baseAmount } from '@thorchain/asgardex-util'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay, distinctUntilChanged, catchError, startWith, debounceTime } from 'rxjs/operators'

import { ETH_DECIMAL } from '../../helpers/assetHelper'
import { eqOString } from '../../helpers/fp/eq'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { Network } from '../app/types'
import { DEFAULT_NETWORK } from '../const'
import { getClient } from '../utils'
import { keystoreService } from '../wallet/service'
import { ApiError, AssetWithBalance, AssetWithBalanceRD, ErrorId } from '../wallet/types'
import { getPhrase } from '../wallet/util'
import { EthereumClientState } from './types'

/**
 * Observable state of `Network`
 */
const { get$: getNetworkState$, set: setNetworkState } = observableState<Network>(DEFAULT_NETWORK)

/**
 * Binance network depending on `Network`
 */
const ethereumNetwork$: Observable<EthereumNetwork> = getNetworkState$.pipe(
  map((network) => {
    if (network === 'testnet') return EthereumNetwork.TEST
    // In case of 'chaosnet' + 'mainnet` use EthereumNetwork.MAIN
    return EthereumNetwork.MAIN
  })
)

/**
 * Stream to create an observable EthereumClient depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new EthereumClient will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `none`
 * A EthereumClient will never be created as long as no phrase is available
 */
const clientState$ = Rx.combineLatest([keystoreService.keystore$, ethereumNetwork$]).pipe(
  mergeMap(
    ([keystore, network]) =>
      new Observable((observer: Observer<EthereumClientState>) => {
        const client: EthereumClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const client = new EthereumClient(network, phrase)
              return O.some(right(client)) as EthereumClientState
            } catch (error) {
              return O.some(left(error))
            }
          })
        )
        observer.next(client)
      }) as Observable<EthereumClientState>
  )
)

export type ClientState = typeof clientState$

const client$: Observable<O.Option<EthereumClient>> = clientState$.pipe(map(getClient), shareReplay(1))

/**
 * Current `Address` depending on selected network
 *
 * If a client is not available (e.g. by removing keystore), it returns `None`
 *
 */
const address$: Observable<O.Option<Address>> = client$.pipe(
  map(FP.pipe(O.chain((client) => O.some(client.getAddress())))),
  distinctUntilChanged(eqOString.equals),
  shareReplay(1)
)

/**
 * Observable to load balances from Binance API endpoint
 * If client is not available, it returns an `initial` state
 */
const loadBalances$ = (client: EthereumClient): Observable<AssetWithBalanceRD> =>
  Rx.from(client.getBalance()).pipe(
    mergeMap((balance) =>
      Rx.of(
        RD.success({
          asset: AssetETH,
          amount: baseAmount(balance.toString(), ETH_DECIMAL),
          frozenAmount: O.none
        } as AssetWithBalance)
      )
    ),
    catchError((error: Error) =>
      Rx.of(RD.failure({ errorId: ErrorId.GET_BALANCES, msg: error?.message ?? '' } as ApiError))
    ),
    startWith(RD.pending)
  )

// `TriggerStream` to reload `Balances`
const { stream$: reloadBalances$, trigger: reloadBalances } = triggerStream()

/**
 * State of `Balance`s provided as `AssetsWithBalanceRD`
 *
 * Data will be loaded by first subscription only
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
const assetWB$: Observable<AssetWithBalanceRD> = Rx.combineLatest([
  reloadBalances$.pipe(debounceTime(300)),
  client$
]).pipe(
  mergeMap(([_, client]) => {
    return FP.pipe(
      client,
      O.fold(
        // if a client is not available, "reset" state to "initial"
        () => Rx.of(RD.initial),
        // or start request and return state
        loadBalances$
      )
    )
  }),
  // cache it to avoid reloading data by every subscription
  shareReplay(1)
)

/**
 * Object with all "public" functions and observables
 */
export { setNetworkState, client$, address$, reloadBalances, assetWB$ }
