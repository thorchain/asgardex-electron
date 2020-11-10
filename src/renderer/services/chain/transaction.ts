import * as RD from '@devexperts/remote-data-ts'
import { baseToAsset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import * as BNB from '../binance/service'
import * as BTC from '../bitcoin/context'
import { selectedAsset$ } from '../wallet/common'
import { ErrorId, TxLD } from '../wallet/types'
import { clientByChain$ } from './client'
import { SendStakeTxParams } from './types'

const sendStakeTx = ({ chain, asset, poolAddress, amount, memo }: SendStakeTxParams): TxLD => {
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
      return BNB.transaction.sendStakeTx({ to: poolAddress, amount: baseToAsset(amount), asset, memo })

    case 'BTC':
      return FP.pipe(
        BTC.getPoolFeeRate(),
        RD.toOption,
        O.fold(
          // TODO (@veado) i18n
          () => stakeTxFailure$('Fee rate for BTC transaction not available'),
          (feeRate) => BTC.sendStakeTx({ to: poolAddress, amount, feeRate, memo })
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

// TODO (@Veado) Move selectedAsset$ to service/chain
const getExplorerTxUrl$: Rx.Observable<O.Option<string>> = selectedAsset$.pipe(
  RxOp.switchMap(
    O.fold(
      () => Rx.of(O.none),
      ({ chain }) =>
        FP.pipe(
          clientByChain$(chain),
          RxOp.map(
            O.map((client) =>
              // we leave `txID` parameter empty to get just the url,
              // but w/o the hash - the hash will be added by the view
              client.getExplorerTxUrl('')
            )
          )
        )
    )
  )
)

export { sendStakeTx, getExplorerTxUrl$ }
