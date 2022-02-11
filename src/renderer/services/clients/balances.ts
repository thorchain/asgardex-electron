import * as RD from '@devexperts/remote-data-ts'
import { Address, Balance, XChainClient } from '@xchainjs/xchain-client'
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

// Currently we have two parameters only for `getBalance` in XChainClient defined,
// but `xchain-btc` has recently added a third parameter `confirmedOnly` and XChainClient needs to be changed in the future,
// @see `xchain-btc` PR 490 https://github.com/xchainjs/xchainjs-lib/pull/490/files#diff-8fc736951c0a12557cfeea25b9e6671889c2bd252e728501d7bd6c914e6cf5b8R105-R107
// TEmproary workaround: Override `XChainClient` interface here
export interface XChainClientOverride extends XChainClient {
  getBalance(address: Address, assets?: Asset[], confirmedOnly?: boolean): Promise<Balance[]>
}
/**
 * Observable to request balances by given `XChainClient` and `Address` (optional)
 * `Balances` are mapped into `WalletBalances`
 *
 * If `address` is not set, it tries to get `Address` of `Client` (which can fail).
 *
 * Empty list of balances returned by client will be ignored and not part of `WalletBalances`
 *
 */
const loadBalances$ = <C extends XChainClientOverride>({
  client,
  walletType,
  address,
  assets,
  walletIndex,
  confirmedOnly
}: {
  client: C
  walletType: WalletType
  address?: Address
  assets?: Asset[]
  walletIndex: number
  confirmedOnly: boolean
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
        Rx.from(client.getBalance(walletAddress, assets, confirmedOnly)).pipe(
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

type Balances$ = ({
  walletType,
  client$,
  trigger$,
  assets,
  walletIndex,
  confirmedOnly
}: {
  walletType: WalletType
  client$: XChainClient$
  trigger$: Rx.Observable<boolean>
  assets?: Asset[]
  walletIndex: number
  confirmedOnly?: boolean
}) => WalletBalancesLD
/**
 * State of `Balances` loaded by given `XChainClient`
 * It will be reloaded by a next value of given `TriggerStream$`
 *
 * `Balances` is loaded by first subscription only, all other subscriber will use same state.
 * To reload `Balances`, trigger a next value to `trigger$` stream
 *
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
export const balances$: Balances$ = ({ walletType, client$, trigger$, assets, walletIndex, confirmedOnly = false }) =>
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
              walletIndex,
              confirmedOnly
            })
        )
      )
    })
  )

type BalancesByAddress$ = ({
  client$,
  trigger$,
  assets,
  confirmedOnly
}: {
  client$: XChainClient$
  trigger$: Rx.Observable<boolean>
  assets?: Asset[]
  confirmedOnly?: boolean
}) => ({
  address,
  walletType,
  walletIndex
}: {
  address: string
  walletType: WalletType
  walletIndex: number
}) => WalletBalancesLD

export const balancesByAddress$: BalancesByAddress$ =
  ({ client$, trigger$, assets, confirmedOnly = false }) =>
  ({ address, walletType, walletIndex }) =>
    Rx.combineLatest([trigger$.pipe(debounceTime(300)), client$]).pipe(
      RxOp.mergeMap(([_, oClient]) => {
        return FP.pipe(
          oClient,
          O.fold(
            // if a client is not available, "reset" state to "initial"
            () => Rx.of(RD.initial),
            // or start request and return state
            (client) => loadBalances$({ client, address, walletType, assets, walletIndex, confirmedOnly })
          )
        )
      }),
      // cache it to avoid reloading data by every subscription
      shareReplay(1)
    )
