import * as RD from '@devexperts/remote-data-ts'
import { assetToBase } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { liveData } from '../../helpers/rx/liveData'
import { observableState } from '../../helpers/stateHelper'
import { getClient } from '../utils'
import { BinanceClientState$, FreezeRD, FreezeTxParams } from './types'

const { get$: txRD$, set: setTxRD } = observableState<FreezeRD>(RD.initial)

const tx$ = ({
  clientState$,
  amount,
  asset,
  action
}: { clientState$: BinanceClientState$ } & FreezeTxParams): Rx.Observable<FreezeRD> =>
  clientState$.pipe(
    map(getClient),
    switchMap((r) => (O.isSome(r) ? Rx.of(r.value) : Rx.EMPTY)),
    switchMap((client) => {
      // freeze
      if (action === 'freeze') {
        return Rx.from(client.freeze({ amount: assetToBase(amount), asset: asset }))
      }
      // unfreeze
      if (action === 'unfreeze') {
        return Rx.from(client.unfreeze({ amount: assetToBase(amount), asset: asset }))
      }
      return Rx.EMPTY
    }),
    map(RD.success),
    liveData.map((txHash) => ({
      code: 200,
      hash: txHash,
      log: 'ok',
      ok: true
    })),
    catchError((error) => {
      return Rx.of(RD.failure(error))
    }),
    startWith(RD.pending)
  )

const pushTx = (clientState$: BinanceClientState$) => ({ amount, asset, action }: FreezeTxParams) =>
  tx$({ clientState$, amount, asset, action }).subscribe(setTxRD)

export const createFreezeService = (client$: BinanceClientState$) => ({
  pushTx: pushTx(client$),
  resetTx: () => setTxRD(RD.initial),
  txRD$
})
