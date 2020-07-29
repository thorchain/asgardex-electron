import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@thorchain/asgardex-binance'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/lib/pipeable'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { ClientState } from './service'

type Transaction = {
  code: number
  hash: string
  log: string
  ok: boolean
}

const { get$: transaction$, set: setTransaction } = observableState<RD.RemoteData<Error, Transaction>>(RD.initial)

const pushTx = (client: ClientState) => (addressTo: Address, amount: number, asset: string, memo?: string) => {
  return client
    .pipe(
      map(O.chain(O.fromEither)),
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
          RD.chain((r) => RD.fromOption(r, () => Error('Transaction: no results received'))),
          RD.map((r) => ({
            code: r.code,
            hash: r.hash,
            log: r.log,
            ok: r.ok
          }))
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
