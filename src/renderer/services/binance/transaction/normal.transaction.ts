import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@thorchain/asgardex-binance'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/lib/pipeable'
import * as Rx from 'rxjs'
import { BehaviorSubject } from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { ClientState } from '../service'

type Transaction = {
  code: number
  hash: string
  log: string
  ok: boolean
}

const transaction$ = new BehaviorSubject<RD.RemoteData<Error, Transaction>>(RD.initial)

const pushTx = (client: ClientState) => (addressTo: Address, amount: number, asset: string) => {
  return client
    .pipe(
      map(O.chain(O.fromEither)),
      switchMap((r) => (O.isSome(r) ? Rx.of(r.value) : Rx.EMPTY))
    )
    .pipe(
      switchMap((client) =>
        Rx.from(client.normalTx(addressTo, amount, asset)).pipe(
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
          startWith(RD.pending)
        )
      )
    )
    .subscribe(transaction$)
}

export const createTransactionService = (client: ClientState) => ({
  transaction$,
  pushTx: pushTx(client)
})
