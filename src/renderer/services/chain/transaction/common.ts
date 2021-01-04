import * as RD from '@devexperts/remote-data-ts'
import { BNBChain, BTCChain, CosmosChain, ETHChain, PolkadotChain, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { observableState } from '../../../helpers/stateHelper'
import { TxTypes } from '../../../types/asgardex'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as THOR from '../../thorchain'
import { ErrorId, TxLD, TxRD } from '../../wallet/types'
import { SendTxParams } from '../types'

/**
 * @deprecated  Don't use this (same) state for all transactions
 * Create custom state for swap, deposit, withdraw txs ...
 */
const { get$: txRD$, set: setTxRD } = observableState<TxRD>(RD.initial)

const sendTx$ = ({ asset, recipient, amount, memo, txType }: SendTxParams): TxLD => {
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
        BTC.getPoolFeeRate(),
        RD.toOption,
        O.fold(
          // TODO (@veado) i18n
          () => txFailure$('Fee rate for BTC transaction not available'),
          (feeRate) => BTC.sendTx({ recipient, amount, feeRate, memo })
        )
      )

    case ETHChain:
      // not available yet
      return txFailure$(`Tx stuff has not been implemented for ETH yet`)

    case THORChain: {
      if (txType === TxTypes.SWAP) {
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

/**
 * @deprecated
 * Don't subscribe different txs to store it into (same) state
 * Create different functions to swap (in `services/chain/transaction/swap), to deposit, to withdraw etc.
 */
const subscribeTx = ({ asset, recipient, amount, memo, txType }: SendTxParams): void => {
  sendTx$({ asset, recipient, amount, memo, txType }).subscribe(setTxRD)
}

const resetTx = () => {
  setTxRD(RD.initial)
}

export { sendTx$, subscribeTx, txRD$, resetTx }
