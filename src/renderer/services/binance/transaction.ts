import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@thorchain/asgardex-binance'
import { AssetAmount, Asset } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { liveData } from '../../helpers/rx/liveData'
import { observableState } from '../../helpers/stateHelper'
import { getClient } from '../utils'
import { ClientState } from './service'
import { TransferRD } from './types'

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
}: { clientState$: ClientState } & SendTxParams): Rx.Observable<TransferRD> =>
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

const pushTx = (clientState$: ClientState) => ({ to, amount, asset, memo }: SendTxParams) =>
  tx$({ clientState$, to, amount, asset, memo }).subscribe(setTxRD)

export const createTransactionService = (client$: ClientState) => ({
  txRD$,
  pushTx: pushTx(client$),
  resetTx: () => setTxRD(RD.initial)
})
