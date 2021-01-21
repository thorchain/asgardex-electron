import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import { BNBChain, BTCChain, Chain, CosmosChain, ETHChain, PolkadotChain, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { TxTypes } from '../../../types/asgardex'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as THOR from '../../thorchain'
import { ErrorId, TxHashLD, TxLD } from '../../wallet/types'
import { SendTxParams } from '../types'

const sendTx$ = ({ asset, recipient, amount, memo, txType, feeOptionKey }: SendTxParams): TxHashLD => {
  // helper to create `RemoteData<ApiError, never>` observable
  const txFailure$ = (msg: string) =>
    Rx.of(
      RD.failure({
        errorId: ErrorId.SEND_TX,
        msg
      })
    )

  switch (asset.chain) {
    case BNBChain:
      return BNB.sendTx({ recipient, amount, asset, memo })

    case BTCChain:
      return FP.pipe(
        BTC.memoFees$(memo),
        liveData.mapLeft((error) => ({
          errorId: ErrorId.GET_FEES,
          msg: error?.message ?? error.toString()
        })),
        liveData.chain(({ rates }) => BTC.sendTx({ recipient, amount, feeRate: rates[feeOptionKey], memo }))
      )

    case ETHChain:
      // not available yet
      return txFailure$(`Tx stuff has not been implemented for ETH yet`)

    case THORChain: {
      if (txType === TxTypes.SWAP || txType === TxTypes.DEPOSIT) {
        return THOR.sendDepositTx({ amount, asset, memo })
      }
      return THOR.sendTx({ amount, asset, memo, recipient })
    }

    case CosmosChain:
      // not available yet
      return txFailure$(`Tx stuff has not been implemented for Cosmos yet`)

    case PolkadotChain:
      // not available yet
      return txFailure$(`Tx stuff has not been implemented for Polkadot yet`)
  }
}

const getTxByChain$ = (txHash: TxHash, chain: Chain) => {
  // helper to create `RemoteData<ApiError, never>` observable
  const failure$ = (msg: string) =>
    Rx.of(
      RD.failure({
        errorId: ErrorId.GET_TX,
        msg
      })
    )

  switch (chain) {
    case BNBChain:
      return BNB.tx$(txHash)
    case BTCChain:
      return BTC.tx$(txHash)
    case ETHChain:
      return failure$(`tx$ has not been implemented for ETH`)
    case THORChain:
      return THOR.tx$(txHash)
    case CosmosChain:
      return failure$(`tx$ has not been implemented for Cosmos`)
    case PolkadotChain:
      return failure$(`tx$ has not been implemented for Polkadot`)
  }
}

/**
 * Check if transaction has been included finally
 *
 * It tries to poll data every 5000 seconds and will never fail.
 * But it stops polling by getting a valid result or by reaching maximum number (50) of requests
 *
 * @param txHash Transaction hash
 * @param chain Chain
 */
const txStatus$ = (txHash: string, chain: Chain): TxLD => {
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
    RxOp.switchMap((_) => getTxByChain$(txHash, chain)),
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

export { sendTx$, txStatus$ }
