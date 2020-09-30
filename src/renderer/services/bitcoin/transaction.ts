import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@thorchain/asgardex-bitcoin'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, mergeMap, shareReplay, startWith, switchMap } from 'rxjs/operators'

import { observableState, triggerStream } from '../../helpers/stateHelper'
import { ApiError, ErrorId, TxRD } from '../wallet/types'
import { Client$ } from './common'
import { FeesLD, FeesRD, SendTxParams, TransactionService } from './types'

const { get$: txRD$, set: setTxRD } = observableState<TxRD>(RD.initial)

const tx$ = ({ client$, to, amount, feeRate, memo }: { client$: Client$ } & SendTxParams): Rx.Observable<TxRD> =>
  client$.pipe(
    switchMap((oClient) => (O.isSome(oClient) ? Rx.of(oClient.value) : Rx.EMPTY)),
    switchMap((client) =>
      memo
        ? Rx.from(client.vaultTx({ addressTo: to, amount: amount.amount().toNumber(), memo, feeRate }))
        : Rx.from(client.normalTx({ addressTo: to, amount: amount.amount().toNumber(), feeRate }))
    ),
    map(RD.success),
    catchError((error) =>
      Rx.of(
        RD.failure({
          errorId: ErrorId.SEND_TX,
          msg: error?.msg ?? error?.toString() ?? `Sending tx to ${to} failed`
        } as ApiError)
      )
    ),
    startWith(RD.pending)
  )

const pushTx = (client$: Client$) => ({ to, amount, feeRate, memo }: SendTxParams) =>
  tx$({ client$, to, amount, feeRate, memo }).subscribe(setTxRD)

// `TriggerStream` to reload `fees`
const { stream$: reloadFees$, trigger: reloadFees } = triggerStream()

/**
 * Observable to load transaction fees
 * If a client is not available, it returns an `initial` state
 */
const loadFees$ = (client: BitcoinClient, memo?: string): Rx.Observable<FeesRD> =>
  Rx.from(client.calcFees(memo)).pipe(
    map(RD.success),
    catchError((error) => Rx.of(RD.failure(error))),
    startWith(RD.pending)
  )

/**
 * Transaction fees
 * If a client is not available, it returns `None`
 */
const fees$ = (client$: Client$): FeesLD =>
  Rx.combineLatest([client$, reloadFees$]).pipe(
    mergeMap(([oClient, _]) =>
      FP.pipe(
        oClient,
        O.fold(() => Rx.of(RD.initial), loadFees$)
      )
    ),
    shareReplay(1)
  )

const createTransactionService = (client$: Client$): TransactionService => ({
  txRD$,
  pushTx: pushTx(client$),
  fees$: fees$(client$),
  reloadFees,
  resetTx: () => setTxRD(RD.initial)
})

export { createTransactionService }
