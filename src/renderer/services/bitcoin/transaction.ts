import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@thorchain/asgardex-bitcoin'
import { BTCChain } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, shareReplay, startWith, switchMap } from 'rxjs/operators'

import { sequenceTOption } from '../../helpers/fpHelpers'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { selectedAsset$ } from '../wallet/common'
import { ApiError, AssetTxsPageLD, ErrorId, TxRD } from '../wallet/types'
import { Client$ } from './common'
import { SendTxParams, TransactionService } from './types'
import { toTxsPage } from './utils'

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

/**
 * Observable to load txs from Binance API endpoint
 * If client is not available, it returns an `initial` state
 */
const loadAssetTxs$ = ({ client }: { client: BitcoinClient }): AssetTxsPageLD => {
  const address = client.getAddress()
  return Rx.from(client.getTransactions(address)).pipe(
    map(toTxsPage),
    map(RD.success),
    catchError((error) =>
      Rx.of(RD.failure({ errorId: ErrorId.GET_ASSET_TXS, msg: error?.message ?? error.toString() } as ApiError))
    ),
    startWith(RD.pending)
  )
}

// `TriggerStream` to reload `Txs`
// TODO (@Veado) Change to `observableState` to add pagination (similar to txs history of Binance)
// https://github.com/thorchain/asgardex-electron/issues/508
const { stream$: reloadAssetTxs$, trigger: loadAssetTxs } = triggerStream()

/**
 * `Txs` history for BTC
 */
const assetTxs$ = (client$: Client$): AssetTxsPageLD =>
  Rx.combineLatest([client$, reloadAssetTxs$, selectedAsset$]).pipe(
    switchMap(([client, _, oAsset]) => {
      return FP.pipe(
        // client and asset has to be available
        // TODO (@Veado) Add pagination (similar to txs history of Binance)
        // https://github.com/thorchain/asgardex-electron/issues/508
        sequenceTOption(client, oAsset),
        // ignore all assets from other chains than BTC
        O.filter(([_, { chain }]) => chain === BTCChain),
        O.fold(
          () => Rx.of(RD.initial),
          ([clientState]) =>
            loadAssetTxs$({
              client: clientState
            })
        )
      )
    }),
    // cache it
    shareReplay(1)
  )

const createTransactionService = (client$: Client$): TransactionService => ({
  txRD$,
  pushTx: pushTx(client$),
  assetTxs$: assetTxs$(client$),
  resetTx: () => setTxRD(RD.initial),
  loadAssetTxs
})

export { createTransactionService }
