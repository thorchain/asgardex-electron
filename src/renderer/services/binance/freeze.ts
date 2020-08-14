import { BncClient } from '@binance-chain/javascript-sdk/lib/client'
import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@thorchain/asgardex-binance'
import { AssetAmount, Asset } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators'

import { FreezeAction } from '../../components/wallet/txs/types'
import { observableState } from '../../helpers/stateHelper'
import { ClientState } from './service'
import { FreezeRD, FreezeResult } from './types'
import { getBinanceClient } from './utils'

const { get$: txRD$, set: setTxRD } = observableState<FreezeRD>(RD.initial)

const freeze$ = ({
  bncClient,
  from,
  asset: { symbol },
  amount
}: {
  bncClient: BncClient
  from: Address
  asset: Asset
  amount: AssetAmount
}): Rx.Observable<FreezeResult> => {
  console.log('bncClient.clientId xxx :', bncClient.chainId)
  return Rx.from(bncClient.tokens.freeze(from, symbol, amount.amount().toNumber()))
}

const unfreeze$ = ({
  bncClient,
  from,
  asset: { symbol },
  amount
}: {
  bncClient: BncClient
  from: Address
  asset: Asset
  amount: AssetAmount
}): Rx.Observable<FreezeResult> => Rx.from(bncClient.tokens.unfreeze(from, symbol, amount.amount().toNumber()))

const pushTx = (clientState$: ClientState, address$: Rx.Observable<O.Option<Address>>) => ({
  amount,
  asset,
  action
}: {
  amount: AssetAmount
  asset: Asset
  action: FreezeAction
}) =>
  clientState$
    .pipe(
      map(getBinanceClient),
      switchMap((r) => (O.isSome(r) ? Rx.of(r.value) : Rx.EMPTY)),
      tap((_) => {
        console.log('amount:', amount)
        console.log('asset:', asset)
        console.log('action:', action)
      }),
      switchMap((client) => Rx.of(client.getBncClient().initChain())),
      switchMap((bncClient) => bncClient),
      tap((bncClient) => console.log('bncClient:', bncClient?.chainId ?? 'unknown')),
      withLatestFrom(address$),
      switchMap(([bncClient, address]) => {
        const from = O.toNullable(address)
        if (from && action === 'freeze') {
          return freeze$({ bncClient, from, asset, amount })
        }
        if (from && action === 'unfreeze') {
          return unfreeze$({ bncClient, from, asset, amount })
        }
        return Rx.EMPTY
      }),
      tap((r) => {
        console.log('result:', r)
      }),
      map((r) => O.fromNullable(r.result)),
      map((r) => RD.fromOption(r, () => Error('Transaction: empty response'))),
      // map((r) =>
      //   FP.pipe(
      //     r,
      //     RD.chain((r) => RD.fromOption(r, () => Error('Transaction: no results received')))
      //   )
      // ),
      catchError((e) => {
        return Rx.of(RD.failure(e))
      }),
      startWith(RD.pending),
      tap(setTxRD)
    )
    .subscribe()

export const createFreezeService = (client$: ClientState, address$: Rx.Observable<O.Option<Address>>) => ({
  pushTx: pushTx(client$, address$),
  resetTx: () => setTxRD(RD.initial),
  txRD$
})
