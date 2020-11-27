import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import { ErrorId, TxLD } from '../wallet/types'
import { SendDepositTxParams } from './types'

const sendDepositTx = ({ chain, asset, poolAddress, amount, memo }: SendDepositTxParams): TxLD => {
  // TODO (@Veado) Health check request for pool address
  // Issue #497: https://github.com/thorchain/asgardex-electron/issues/497

  // helper to create `RemoteData<ApiError, never>` observable
  const stakeTxFailure$ = (msg: string) =>
    Rx.of(
      RD.failure({
        errorId: ErrorId.SEND_TX,
        msg
      })
    )

  switch (chain) {
    case 'BNB':
      return BNB.sendDepositTx({ recipient: poolAddress, amount, asset, memo })

    case 'BTC':
      return FP.pipe(
        BTC.getPoolFeeRate(),
        RD.toOption,
        O.fold(
          // TODO (@veado) i18n
          () => stakeTxFailure$('Fee rate for BTC transaction not available'),
          (feeRate) => BTC.sendDepositTx({ recipient: poolAddress, amount, feeRate, memo })
        )
      )

    case 'ETH':
      // not available yet
      return stakeTxFailure$('Stake tx has not been implemented for ETH yet')

    case 'THOR':
      // not available yet
      return stakeTxFailure$('Stake tx has not been implemented for THORChain yet')
  }
}

export { sendDepositTx }
