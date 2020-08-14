import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@thorchain/asgardex-binance'
import { AssetAmount, Asset } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/lib/pipeable'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { ClientState } from './service'
import { TransferRD } from './types'
import { getBinanceClient } from './utils'

const { get$: tx$, set: setTransaction } = observableState<TransferRD>(RD.initial)

const pushTx = (clientState: ClientState) => ({
  to,
  amount,
  asset: { symbol },
  memo
}: {
  to: Address
  amount: AssetAmount
  asset: Asset
  memo?: string
}) => {
  return clientState
    .pipe(
      map(getBinanceClient),
      switchMap((r) => (O.isSome(r) ? Rx.of(r.value) : Rx.EMPTY))
    )
    .pipe(
      switchMap((client) =>
        memo
          ? Rx.from(client.vaultTx(to, amount.amount().toNumber(), symbol, memo))
          : Rx.from(client.normalTx(to, amount.amount().toNumber(), symbol))
      ),
      map((r) => O.fromNullable(r.result)),
      map((r) => RD.fromOption(r, () => Error('Transaction: empty response'))),
      map((r) =>
        FP.pipe(
          r,
          RD.map(A.head),
          RD.chain((r) => RD.fromOption(r, () => Error('Transaction: no results received')))
        )
      ),
      catchError((e) => {
        return Rx.of(RD.failure(e))
      }),
      startWith(RD.pending),
      tap(setTransaction)
    )
    .subscribe()
}

export const createTransactionService = (client: ClientState) => ({
  tx$,
  pushTx: pushTx(client),
  resetTx: () => setTransaction(RD.initial)
})
