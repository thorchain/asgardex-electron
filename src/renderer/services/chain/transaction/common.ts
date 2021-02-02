import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import {
  BCHChain,
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  ETHChain,
  LTCChain,
  PolkadotChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'

import { liveData } from '../../../helpers/rx/liveData'
import { TxTypes } from '../../../types/asgardex'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as ETH from '../../ethereum'
import * as THOR from '../../thorchain'
import { ErrorId, TxHashLD, TxLD } from '../../wallet/types'
import { SendTxParams } from '../types'

export const sendTx$ = ({ asset, recipient, amount, memo, txType, feeOptionKey }: SendTxParams): TxHashLD => {
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
      return ETH.sendTx({ asset, recipient, amount, memo, feeOptionKey })

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
    case BCHChain:
      // not available yet
      return txFailure$(`Tx stuff has not been implemented for Bitcoin Cash yet`)
    case LTCChain:
      // not available yet
      return txFailure$(`Tx stuff has not been implemented for Litecoin yet`)
  }
}

export const txStatusByChain$ = (txHash: TxHash, chain: Chain): TxLD => {
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
      return BNB.txStatus$(txHash)
    case BTCChain:
      return BTC.txStatus$(txHash)
    case ETHChain:
      return ETH.txStatus$(txHash)
    case THORChain:
      return THOR.txStatus$(txHash)
    case CosmosChain:
      return failure$(`txStatus$ has not been implemented for Cosmos`)
    case PolkadotChain:
      return failure$(`txStatus$ has not been implemented for Polkadot`)
    case BCHChain:
      return failure$(`txStatus$ has not been implemented for Bitcoin Cash`)
    case LTCChain:
      return failure$(`txStatus$ has not been implemented for Litecoin`)
  }
}
