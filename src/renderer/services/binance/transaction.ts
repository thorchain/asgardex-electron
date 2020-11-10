import * as RD from '@devexperts/remote-data-ts'
import { Address, WS } from '@xchainjs/xchain-binance'
import { AssetAmount, Asset, assetToBase } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/pipeable'
import * as Rx from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'
import * as RxOp from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { getClient } from '../utils'
import { TxRD, TxLD } from '../wallet/types'
import { BinanceClientState$, TransactionService, TxWithStateLD } from './types'

const { get$: txRD$, set: setTxRD } = observableState<TxRD>(RD.initial)

export type SendTxParams = {
  to: Address
  amount: AssetAmount
  asset: Asset
  memo?: string
}

const tx$ = ({ clientState$, to, amount, asset, memo }: { clientState$: BinanceClientState$ } & SendTxParams): TxLD =>
  clientState$.pipe(
    map(getClient),
    switchMap((r) => (O.isSome(r) ? Rx.of(r.value) : Rx.EMPTY)),
    switchMap((client) =>
      Rx.from(
        client.transfer({
          asset,
          amount: assetToBase(amount),
          recipient: to,
          memo
        })
      )
    ),
    map(RD.success),
    startWith(RD.pending)
  )

const pushTx = (clientState$: BinanceClientState$) => ({ to, amount, asset, memo }: SendTxParams): Rx.Subscription =>
  tx$({ clientState$, to, amount, asset, memo }).subscribe(setTxRD)

const sendStakeTx = (clientState$: BinanceClientState$) => ({ to, amount, asset, memo }: SendTxParams): TxLD =>
  tx$({ clientState$, to, amount, asset, memo })

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
  sendStakeTx: sendStakeTx(client$),
  resetTx: () => setTxRD(RD.initial)
})
