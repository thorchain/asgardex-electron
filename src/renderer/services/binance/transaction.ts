import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@thorchain/asgardex-binance'
import { WS } from '@thorchain/asgardex-binance'
import { AssetAmount, Asset } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/pipeable'
import * as Rx from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'
import * as RxOp from 'rxjs/operators'

import { liveData } from '../../helpers/rx/liveData'
import { observableState } from '../../helpers/stateHelper'
import { getClient } from '../utils'
import { ApiError, ErrorId, TxRD } from '../wallet/types'
import { BinanceClientState$, TransactionService, TxWithStateLD } from './types'

const { get$: txRD$, set: setTxRD } = observableState<TxRD>(RD.initial)

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
}: { clientState$: BinanceClientState$ } & SendTxParams): Rx.Observable<TxRD> =>
  clientState$.pipe(
    map(getClient),
    switchMap((r) => (O.isSome(r) ? Rx.of(r.value) : Rx.EMPTY)),
    switchMap((client) =>
      memo
        ? Rx.from(client.vaultTx({ addressTo: to, amount: amount.amount().toString(), asset: symbol, memo }))
        : Rx.from(client.normalTx({ addressTo: to, amount: amount.amount().toString(), asset: symbol }))
    ),
    map(({ result }) => O.fromNullable(result)),
    map((transfers) =>
      RD.fromOption(transfers, () => ({ errorId: ErrorId.SEND_TX, msg: 'Transaction: empty response' } as ApiError))
    ),
    liveData.map(A.head),
    liveData.chain(
      liveData.fromOption(() => ({ errorId: ErrorId.SEND_TX, msg: 'Transaction: no results received' } as ApiError))
    ),
    liveData.map(({ hash }) => hash),
    startWith(RD.pending)
  )

const pushTx = (clientState$: BinanceClientState$) => ({ to, amount, asset, memo }: SendTxParams) =>
  tx$({ clientState$, to, amount, asset, memo }).subscribe(setTxRD)

const txWithState$ = (wsTransfer$: Rx.Observable<O.Option<WS.Transfer>>): TxWithStateLD =>
  FP.pipe(
    Rx.combineLatest([txRD$, wsTransfer$]),
    RxOp.map(([tx, state]) =>
      FP.pipe(
        tx,
        RD.map((txHash) => ({ txHash, state }))
      )
    )
  )

export const createTransactionService = (
  client$: BinanceClientState$,
  wsTransfer$: Rx.Observable<O.Option<WS.Transfer>>
): TransactionService => ({
  txRD$,
  txWithState$: txWithState$(wsTransfer$),
  pushTx: pushTx(client$),
  resetTx: () => setTxRD(RD.initial)
})
