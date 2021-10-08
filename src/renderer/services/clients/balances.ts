import * as RD from '@devexperts/remote-data-ts'
import { Address, XChainClient } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'
import { catchError, startWith, map, shareReplay, debounceTime } from 'rxjs/operators'

import { WalletType } from '../../../shared/wallet/types'
import { liveData } from '../../helpers/rx/liveData'
import { ApiError, ErrorId } from '../wallet/types'
import { WalletBalancesLD, XChainClient$ } from './types'

/**
 * Observable to request balances by given `XChainClient` and `Address` (optional)
 * `Balances` are mapped into `WalletBalances`
 *
 * If `address` is not set, it tries to get `Address` of `Client` (which can fail).
 *
 * Empty list of balances returned by client will be ignored and not part of `WalletBalances`
 *
 */
const loadBalances$ = ({
  client,
  walletType,
  address,
  assets,
  /* TODO (@asgdx-team) Check if we still can use `0` as default by introducing HD wallets in the future */
  walletIndex = 0
}: {
  client: XChainClient
  walletType: WalletType
  address?: Address
  assets?: Asset[]
  walletIndex?: number
}): WalletBalancesLD =>
  FP.pipe(
    address,
    O.fromNullable,
    // Try to use client address, if parameter `address` is undefined
    O.alt(() => O.tryCatch(() => client.getAddress(walletIndex))),
    O.fold(
      // TODO (@Veado) i18n
      () => Rx.of(RD.failure<ApiError>({ errorId: ErrorId.GET_BALANCES, msg: 'Could not get address' })),
      (walletAddress) =>
        Rx.from(client.getBalance(walletAddress, assets)).pipe(
          map(RD.success),
          liveData.map(
            A.map((balance) => ({
              ...balance,
              walletType,
              walletAddress,
              walletIndex
            }))
          ),
          catchError((error: Error) =>
            Rx.of(RD.failure<ApiError>({ errorId: ErrorId.GET_BALANCES, msg: error?.message ?? '' }))
          ),
          startWith(RD.pending)
        )
    )
  )

/**
 * State of `Balances` loaded by given `XChainClient`
 * It will be reloaded by a next value of given `TriggerStream$`
 *
 * `Balances` is loaded by first subscription only, all other subscriber will use same state.
 * To reload `Balances`, trigger a next value to `trigger$` stream
 *
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
export const balances$: ({
  walletType,
  client$,
  trigger$,
  assets,
  walletIndex
}: {
  walletType: WalletType
  client$: XChainClient$
  trigger$: Rx.Observable<boolean>
  assets?: Asset[]
  walletIndex?: number
}) => WalletBalancesLD = ({ walletType, client$, trigger$, assets, walletIndex }) =>
  Rx.combineLatest([trigger$.pipe(debounceTime(300)), client$]).pipe(
    RxOp.switchMap(([_, oClient]) => {
      return FP.pipe(
        oClient,
        O.fold(
          // if a client is not available, "reset" state to "initial"
          () => Rx.of(RD.initial),
          // or start request and return state
          (client) =>
            loadBalances$({
              walletType,
              client,
              assets,
              walletIndex
            })
        )
      )
    })
  )

export const balancesByAddress$: (
  client$: XChainClient$,
  trigger$: Rx.Observable<boolean>,
  assets?: Asset[]
) => (address: string, walletType: WalletType) => WalletBalancesLD =
  (client$, trigger$, assets) => (address, walletType) =>
    Rx.combineLatest([trigger$.pipe(debounceTime(300)), client$]).pipe(
      RxOp.mergeMap(([_, oClient]) => {
        return FP.pipe(
          oClient,
          O.fold(
            // if a client is not available, "reset" state to "initial"
            () => Rx.of(RD.initial),
            // or start request and return state
            (client) => loadBalances$({ client, address, walletType, assets })
          )
        )
      }),
      // cache it to avoid reloading data by every subscription
      shareReplay(1)
    )
