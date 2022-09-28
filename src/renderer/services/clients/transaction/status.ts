import * as RD from '@devexperts/remote-data-ts'
import { TxHash, XChainClient } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { TxLD } from '../../wallet/types'
import { XChainClient$ } from '../types'
import { loadTx$ } from './common'

/**
 * Check if transaction has been included finally
 *
 * It tries to poll data every 5000 seconds and will never fail.
 * But it stops polling by getting a valid result or by reaching maximum number (50) of requests
 *
 * @param txHash Transaction hash
 * @param chain Chain
 */
export const txStatusByClient$ = ({
  client,
  txHash,
  assetAddress
}: {
  client: XChainClient
  txHash: string
  assetAddress: O.Option<Address>
}): TxLD => {
  // max. number of requests
  const MAX = 50
  // Status to do another poll or not
  const { get$: hasResult$, set: setHasResult } = observableState(false)
  // state of counting request
  const { get$: count$, get: getCount, set: setCount } = observableState(0)
  // Stream to check to stop polling or not
  const stopInterval$ = Rx.combineLatest([hasResult$, count$]).pipe(
    RxOp.filter(([hasResult, count]) => hasResult || count > MAX)
  )

  return FP.pipe(
    Rx.interval(5000),
    // Run interval as long as we don't have a valid result or MAX number of requests
    RxOp.takeUntil(stopInterval$),
    // count requests
    RxOp.tap(() => setCount(getCount() + 1)),
    RxOp.switchMap((_) => loadTx$({ client, txHash, assetAddress })),
    liveData.map((result) => {
      // update state to stop polling
      setHasResult(true)
      return result
    }),
    // As long as we don't reach MAX, we accept succeeded result only (but no errors)
    // After reaching MAX we don't filter anything and will show error if its happen
    RxOp.filter((result) => (getCount() < MAX ? RD.isSuccess(result) : true)),
    RxOp.startWith(RD.pending)
  )
}

/**
 * Checks status of a transaction
 *
 * It polls data for tx every 5000 seconds and will never fail.
 * But it stops polling by getting a valid result or by reaching maximum number (50) of requests
 *
 * @param txHash Transaction hash
 * @param chain Chain
 */
export const txStatus$: (client$: XChainClient$) => (txHash: TxHash, assetAddres: O.Option<Address>) => TxLD =
  (client$) => (txHash, assetAddress) =>
    client$.pipe(
      RxOp.switchMap((oClient) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial),
            (client) => txStatusByClient$({ client, txHash, assetAddress })
          )
        )
      )
    )
