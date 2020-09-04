import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@thorchain/asgardex-binance'
import { WS } from '@thorchain/asgardex-binance'
import { AssetAmount, Asset } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'
import * as RxOperators from 'rxjs/operators'

import { liveData } from '../../helpers/rx/liveData'
import { observableState } from '../../helpers/stateHelper'
import { getClient } from '../utils'
import { TransferRD, BinanceClientState$ } from './types'

const { get$: txRD$, set: setTxRD } = observableState<TransferRD>(RD.initial)

export type SendTxParams = {
  to: Address
  amount: AssetAmount
  asset: Asset
  memo?: string
}

const tx$ = ({
  clientState$,
  to,
  amount,
  asset: { symbol },
  memo
}: { clientState$: BinanceClientState$ } & SendTxParams): Rx.Observable<TransferRD> =>
  clientState$.pipe(
    map(getClient),
    switchMap((r) => (O.isSome(r) ? Rx.of(r.value) : Rx.EMPTY)),
    switchMap((client) =>
      memo
        ? Rx.from(client.vaultTx({ addressTo: to, amount: amount.amount().toString(), asset: symbol, memo }))
        : Rx.from(client.normalTx({ addressTo: to, amount: amount.amount().toString(), asset: symbol }))
    ),
    map(({ result }) => O.fromNullable(result)),
    map((transfers) => RD.fromOption(transfers, () => Error('Transaction: empty response'))),
    liveData.map(A.head),
    liveData.chain(liveData.fromOption(() => Error('Transaction: no results received'))),
    catchError((error) => Rx.of(RD.failure(error))),
    startWith(RD.pending)
  )

const pushTx = (clientState$: BinanceClientState$) => ({ to, amount, asset, memo }: SendTxParams) =>
  tx$({ clientState$, to, amount, asset, memo }).subscribe(setTxRD)

export const createTransactionService = (
  client$: BinanceClientState$,
  wsTransfer$: Rx.Observable<O.Option<WS.Transfer>>
) => ({
  txRD$,
  txWithState$: pipe(
    Rx.combineLatest([txRD$, wsTransfer$]),

    RxOperators.map(([tx, state]) =>
      pipe(
        tx,
        RD.map((tx) => ({ tx, state }))
      )
    ),
    RxOperators.catchError((e) => Rx.of(RD.failure(e)))
  ),
  pushTx: pushTx(client$),
  resetTx: () => setTxRD(RD.initial)
})
