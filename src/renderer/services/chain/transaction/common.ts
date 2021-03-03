import * as RD from '@devexperts/remote-data-ts'
import { Address, TxHash } from '@xchainjs/xchain-client'
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

import { DEFAULT_FEE_OPTION_KEY } from '../../../components/wallet/txs/send/Send.const'
import { liveData } from '../../../helpers/rx/liveData'
import { TxTypes } from '../../../types/asgardex'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as BCH from '../../bitcoincash'
import * as ETH from '../../ethereum'
import * as LTC from '../../litecoin'
import * as THOR from '../../thorchain'
import { ErrorId, TxHashLD, TxLD } from '../../wallet/types'
import { SendTxParams } from '../types'

export const sendTx$ = ({
  asset,
  recipient,
  amount,
  memo,
  txType,
  feeOptionKey = DEFAULT_FEE_OPTION_KEY
}: SendTxParams): TxHashLD => {
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
        BTC.feesWithRates$(memo),
        liveData.mapLeft((error) => ({
          errorId: ErrorId.GET_FEES,
          msg: error?.message ?? error.toString()
        })),
        liveData.chain(({ rates }) => BTC.sendTx({ recipient, amount, feeRate: rates[feeOptionKey], memo }))
      )

    case ETHChain:
      return ETH.sendTx({ asset, recipient, amount, memo, feeOptionKey })

    case THORChain: {
      if (txType === TxTypes.SWAP || txType === TxTypes.DEPOSIT || txType === TxTypes.WITHDRAW) {
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
      return FP.pipe(
        BCH.feesWithRates$(memo),
        liveData.mapLeft((error) => ({
          errorId: ErrorId.GET_FEES,
          msg: error?.message ?? error.toString()
        })),
        liveData.chain(({ rates }) => BCH.sendTx({ recipient, amount, feeRate: rates[feeOptionKey], memo }))
      )
    case LTCChain:
      return FP.pipe(
        LTC.feesWithRates$(memo),
        liveData.mapLeft((error) => ({
          errorId: ErrorId.GET_FEES,
          msg: error?.message ?? error.toString()
        })),
        liveData.chain(({ rates }) => {
          return LTC.sendTx({ recipient, amount, asset, memo, feeRate: rates[feeOptionKey] })
        })
      )
  }
}

export const txStatusByChain$ = (txHash: TxHash, chain: Chain, assetAddress?: Address): TxLD => {
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
      return ETH.txStatus$(txHash, assetAddress)
    case THORChain:
      return THOR.txStatus$(txHash)
    case CosmosChain:
      return failure$(`txStatus$ has not been implemented for Cosmos`)
    case PolkadotChain:
      return failure$(`txStatus$ has not been implemented for Polkadot`)
    case BCHChain:
      return BCH.txStatus$(txHash)
    case LTCChain:
      return LTC.txStatus$(txHash)
  }
}
