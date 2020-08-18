// import { BncClient } from '@binance-chain/javascript-sdk/lib/client'
import * as RD from '@devexperts/remote-data-ts'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/lib/pipeable'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { ClientState } from './service'
import { FreezeRD, FreezeTxParams } from './types'
import { getBinanceClient } from './utils'

const { get$: txRD$, set: setTxRD } = observableState<FreezeRD>(RD.initial)

const tx$ = ({
  clientState$,
  amount,
  asset,
  action
}: { clientState$: ClientState } & FreezeTxParams): Rx.Observable<FreezeRD> =>
  clientState$.pipe(
    map(getBinanceClient),
    switchMap((r) => (O.isSome(r) ? Rx.of(r.value) : Rx.EMPTY)),
    switchMap((client) => {
      // freeze
      if (action === 'freeze') {
        return Rx.from(client.freeze(amount.amount().toNumber(), asset.symbol))
      }
      // unffreeze
      if (action === 'unfreeze') {
        return Rx.from(client.unfreeze(amount.amount().toNumber(), asset.symbol))
      }
      return Rx.EMPTY
    }),
    map(({ result }) => O.fromNullable(result)),
    map((transfers) => RD.fromOption(transfers, () => Error('Transaction: empty response'))),
    map((transfers) =>
      FP.pipe(
        transfers,
        RD.map(A.head),
        RD.chain((transfer) => RD.fromOption(transfer, () => Error('Transaction: no results received')))
      )
    ),
    catchError((error) => {
      return Rx.of(RD.failure(error))
    }),
    startWith(RD.pending)
  )

const pushTx = (clientState$: ClientState) => ({ amount, asset, action }: FreezeTxParams) =>
  tx$({ clientState$, amount, asset, action }).subscribe(setTxRD)

export const createFreezeService = (client$: ClientState) => ({
  pushTx: pushTx(client$),
  resetTx: () => setTxRD(RD.initial),
  txRD$
})
