import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { TxLD } from '../../wallet/types'
import { XChainClient$, TxsPageLD, TxsParams } from '../types'
import { loadTx$, loadTxs$ } from './common'

/**
 * `Txs` state by given client
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
export const txsByClient$: (client$: XChainClient$) => (params: TxsParams) => TxsPageLD =
  (client$) =>
  ({ asset, limit, offset, walletAddress, walletIndex }) =>
    client$.pipe(
      RxOp.switchMap((oClient) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial),
            (client) =>
              loadTxs$({
                client,
                asset,
                limit,
                offset,
                walletAddress,
                walletIndex
              })
          )
        )
      )
    )
/**
 * Gets data of a `Tx` by given client
 * If a client is not available, it returns an `initial` state
 */
export const txByClient$: (client$: XChainClient$) => (txHash: TxHash) => TxLD = (client$) => (txHash) =>
  client$.pipe(
    RxOp.switchMap((oClient) =>
      FP.pipe(
        oClient,
        O.fold(
          () => Rx.of(RD.initial),
          (client) => loadTx$({ client, txHash, assetAddress: O.none })
        )
      )
    )
  )
