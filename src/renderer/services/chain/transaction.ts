import * as RD from '@devexperts/remote-data-ts'
import { BNBChain, BTCChain, CosmosChain, ETHChain, PolkadotChain, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { observableState } from '../../helpers/stateHelper'
import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import * as THOR from '../thorchain'
import { ErrorId, TxLD, TxRD } from '../wallet/types'
import { SendTxParams } from './types'

const { get$: txRD$, set: setTxRD } = observableState<TxRD>(RD.initial)

const tx$ = ({ asset, recipient, amount, memo }: SendTxParams): TxLD => {
  // TODO (@Veado) Health check request for pool address
  // Issue #497: https://github.com/thorchain/asgardex-electron/issues/497

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

    case THORChain:
      return THOR.sendTx({ recipient, amount, asset, memo })

    case CosmosChain:
      // not available yet
      return txFailure$(`Tx stuff has not been implemented for Cosmos yet`)

    case PolkadotChain:
      // not available yet
      return txFailure$(`Tx stuff has not been implemented for Polkadot yet`)
  }
}

const sendTx = ({ asset, recipient, amount, memo }: SendTxParams): void => {
  tx$({ asset, recipient, amount, memo }).subscribe(setTxRD)
}

const resetTx = () => {
  setTxRD(RD.initial)
}

export { sendTx, txRD$, resetTx }
