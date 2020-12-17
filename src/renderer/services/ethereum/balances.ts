import * as RD from '@devexperts/remote-data-ts'
import { Client } from '@thorchain/asgardex-ethereum'
import { AssetETH, baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { mergeMap, shareReplay, catchError, startWith, debounceTime } from 'rxjs/operators'

import { ETH_DECIMAL } from '../../helpers/assetHelper'
import { triggerStream } from '../../helpers/stateHelper'
import { WalletBalanceLD } from '../clients'
import { ApiError, ErrorId } from '../wallet/types'
import { client$ } from './common'

/**
 * Observable to load balances
 * If client is not available, it returns an `initial` state
 *
 * TODO (@Veado / @ThatStrangeGuy) Use `loadBalances$` of `services/clients` once `xchain-ethereum` has been updated
 */
const loadBalances$ = (client: Client): WalletBalanceLD =>
  FP.pipe(
    O.tryCatch(() => client.getAddress()),
    O.fold(
      () =>
        Rx.of(
          RD.failure<ApiError>({
            errorId: ErrorId.GET_BALANCES,
            // TODO (@Veado) Add i18n
            msg: 'Cant get address from client'
          })
        ),
      (walletAddress) =>
        Rx.from(client.getBalance()).pipe(
          mergeMap((balance) =>
            Rx.of(
              RD.success({
                asset: AssetETH,
                amount: baseAmount(balance.toString(), ETH_DECIMAL),
                walletAddress
              })
            )
          ),
          catchError((error: Error) =>
            Rx.of(
              RD.failure<ApiError>({ errorId: ErrorId.GET_BALANCES, msg: error?.message ?? '' })
            )
          ),
          startWith(RD.pending)
        )
    )
  )

// `TriggerStream` to reload `Balances`
const { stream$: reloadBalances$, trigger: reloadBalances } = triggerStream()

/**
 * State of `Balance`s provided as `BalanceRD`
 *
 * Data will be loaded by first subscription only
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
const balances$: WalletBalanceLD = Rx.combineLatest([reloadBalances$.pipe(debounceTime(300)), client$]).pipe(
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

export { loadBalances$, reloadBalances, balances$ }
