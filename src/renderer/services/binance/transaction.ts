import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@thorchain/asgardex-binance'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/lib/pipeable'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { ClientState } from './service'
import { TransferRD } from './types'
import { getBinanceClient } from './utils'

const { get$: transaction$, set: setTransaction } = observableState<TransferRD>(RD.initial)

const pushTx = (clientState: ClientState) => (addressTo: Address, amount: number, asset: string, memo?: string) => {
  return clientState
    .pipe(
      map(getBinanceClient),
      switchMap((r) => (O.isSome(r) ? Rx.of(r.value) : Rx.EMPTY))
    )
    .pipe(
      switchMap((client) =>
        memo
          ? Rx.from(client.vaultTx(addressTo, amount, asset, memo))
          : Rx.from(client.normalTx(addressTo, amount, asset))
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
  transaction$,
  pushTx: pushTx(client),
  resetTx: () => setTransaction(RD.initial)
})
