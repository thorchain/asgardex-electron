// import { BncClient } from '@binance-chain/javascript-sdk/lib/client'
import * as RD from '@devexperts/remote-data-ts'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { liveData } from '../../helpers/rx/liveData'
import { observableState } from '../../helpers/stateHelper'
import { getClient } from '../utils'
import { ClientState } from './service'
import { FreezeRD, FreezeTxParams } from './types'

const { get$: txRD$, set: setTxRD } = observableState<FreezeRD>(RD.initial)

const tx$ = ({
  clientState$,
  amount,
  asset,
  action
}: { clientState$: ClientState } & FreezeTxParams): Rx.Observable<FreezeRD> =>
  clientState$.pipe(
    map(getClient),
    switchMap((r) => (O.isSome(r) ? Rx.of(r.value) : Rx.EMPTY)),
    switchMap((client) => {
      // freeze
      if (action === 'freeze') {
        return Rx.from(client.freeze({ amount: amount.amount().toString(), asset: asset.symbol }))
      }
      // unfreeze
      if (action === 'unfreeze') {
        return Rx.from(client.unfreeze({ amount: amount.amount().toString(), asset: asset.symbol }))
      }
      return Rx.EMPTY
    }),
    map(({ result }) => O.fromNullable(result)),
    map((transfers) => RD.fromOption(transfers, () => Error('Transaction: empty response'))),
    liveData.map(A.head),
    liveData.chain(liveData.fromOption(() => Error('Transaction: no results received'))),
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
