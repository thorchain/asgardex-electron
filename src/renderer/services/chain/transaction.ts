import * as RD from '@devexperts/remote-data-ts'
import { Asset, BaseAmount, baseToAsset, Chain } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { liveData } from '../../helpers/rx/liveData'
import * as BNB from '../binance/service'
import * as BTC from '../bitcoin/context'
import { ErrorId, TxLD } from '../wallet/types'
import { baseChainStakeMemo$, crossChainStakeMemo$ } from './memo'
import { Memo, MemoRx } from './types'

const sendStakeTxByChain = ({
  chain,
  asset,
  poolAddress,
  amount,
  memo$
}: {
  chain: Chain
  asset: Asset
  poolAddress: string
  amount: BaseAmount
  memo$: MemoRx // base or x-chain memo
}): TxLD => {
  // TODO (@Veado) Health check request for pool address
  // Issue #497: https://github.com/thorchain/asgardex-electron/issues/497

  // Stream to check memo
  const checkMemo$ = (onMemo: (memo: Memo) => TxLD) =>
    memo$.pipe(
      RxOp.switchMap((oMemo) =>
        FP.pipe(
          oMemo,
          O.fold(() => Rx.of(RD.failure({ errorId: ErrorId.SEND_TX, msg: 'Memo is not available' })), onMemo)
        )
      )
    )
  // Return `sendStakeTx` based on selected chain
  switch (chain) {
    case 'BNB':
      return checkMemo$((memo) =>
        BNB.transaction.sendStakeTx({ to: poolAddress, amount: baseToAsset(amount), asset, memo })
      )

    case 'BTC':
      return checkMemo$((memo) =>
        BTC.poolFeeRate$(memo).pipe(
          RxOp.map(
            RD.mapLeft(() => ({
              errorId: ErrorId.SEND_TX,
              msg: 'Fee rate for BTC transaction could not been loaded '
            }))
          ),
          liveData.chain((feeRate) => BTC.sendStakeTx({ to: poolAddress, amount, feeRate, memo }))
        )
      )

    case 'ETH':
      // not available yet
      return Rx.of(
        RD.failure({ errorId: ErrorId.SEND_TX, msg: 'Stake tx has not been implemented for ETH yet' })
      ) as TxLD
    case 'THOR':
      // not available yet
      return Rx.of(
        RD.failure({ errorId: ErrorId.SEND_TX, msg: 'Stake tx has not been implemented for THORChain yet' })
      ) as TxLD
  }
}

const sendStakeTxToBaseChain = ({
  chain,
  asset,
  poolAddress,
  amount
}: {
  chain: Chain
  asset: Asset
  poolAddress: string
  amount: BaseAmount
}): TxLD =>
  sendStakeTxByChain({
    chain,
    asset,
    poolAddress,
    amount,
    memo$: baseChainStakeMemo$
  })

const sendStakeTxToCrossChain = ({
  chain,
  asset,
  poolAddress,
  amount
}: {
  chain: Chain
  asset: Asset
  poolAddress: string
  amount: BaseAmount
}): TxLD =>
  sendStakeTxByChain({
    chain,
    asset,
    poolAddress,
    amount,
    memo$: crossChainStakeMemo$
  })

export { sendStakeTxToBaseChain, sendStakeTxToCrossChain }
