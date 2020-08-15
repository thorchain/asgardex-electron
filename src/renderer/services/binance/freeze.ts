// import { BncClient } from '@binance-chain/javascript-sdk/lib/client'
import * as RD from '@devexperts/remote-data-ts'
import { AssetAmount, Asset } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators'

import { FreezeAction } from '../../components/wallet/txs/types'
import { observableState } from '../../helpers/stateHelper'
import { ClientState } from './service'
import { FreezeRD } from './types'
import { getBinanceClient } from './utils'

const { get$: txRD$, set: setTxRD } = observableState<FreezeRD>(RD.initial)

const pushTx = (clientState$: ClientState) => ({
  amount,
  asset,
  action
}: {
  amount: AssetAmount
  asset: Asset
  action: FreezeAction
}) =>
  clientState$
    .pipe(
      map(getBinanceClient),
      switchMap((r) => (O.isSome(r) ? Rx.of(r.value) : Rx.EMPTY)),
      tap((_) => {
        console.log('amount:', amount)
        console.log('asset:', asset)
        console.log('action:', action)
      }),
      switchMap((client) => {
        if (action === 'freeze') {
          return Rx.from(client.freeze(amount.amount().toNumber(), asset.symbol))
        }
        if (action === 'unfreeze') {
          return Rx.from(client.unfreeze(amount.amount().toNumber(), asset.symbol))
        }
        return Rx.EMPTY
      }),
      tap((r) => {
        console.log('result:', r)
      }),
      map((r) => O.fromNullable(r.result)),
      map((r) => RD.fromOption(r, () => Error('Transaction: empty response'))),
      catchError((e) => {
        return Rx.of(RD.failure(e))
      }),
      startWith(RD.pending),
      tap(setTxRD)
    )
    .subscribe()

export const createFreezeService = (client$: ClientState) => ({
  pushTx: pushTx(client$),
  resetTx: () => setTxRD(RD.initial),
  txRD$
})
