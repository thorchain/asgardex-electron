import * as RD from '@devexperts/remote-data-ts'
import { Asset, BaseAmount, baseToAsset, Chain } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import * as BNB from '../binance/service'
import * as BTC from '../bitcoin/context'
import { Memo } from './types'

const sendMemoTxByChain = ({
  chain,
  asset,
  poolAddress,
  amount,
  oMemo
}: {
  chain: Chain
  asset: Asset
  poolAddress: string
  amount: BaseAmount
  oMemo: O.Option<Memo>
}) => {
  switch (chain) {
    case 'BNB':
      FP.pipe(
        oMemo,
        O.fold(
          () => Rx.of(RD.initial),
          (memo) => BNB.transaction.pushTx({ to: poolAddress, amount: baseToAsset(amount), asset, memo })
        )
      )

      break
    case 'BTC':
      FP.pipe(
        oMemo,
        O.fold(
          () => Rx.of(RD.initial),
          (memo) =>
            FP.pipe(
              BTC.stakeFeeRate$(memo),
              RxOp.switchMap((feeRate) => BTC.pushTx({ to: poolAddress, amount, feeRate, memo }))
            )
        )
      )
      break
    case 'ETH':
      // not available yet
      break
    case 'THOR':
      // not available yet
      break
    default:
  }
}

export { sendMemoTxByChain }
