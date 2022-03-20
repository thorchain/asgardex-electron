import * as RD from '@devexperts/remote-data-ts'
import { Address, TxHash } from '@xchainjs/xchain-client'
import {
  BCHChain,
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  TerraChain,
  PolkadotChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { DEFAULT_FEE_OPTION } from '../../../components/wallet/txs/send/Send.const'
import { LiveData, liveData } from '../../../helpers/rx/liveData'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as BCH from '../../bitcoincash'
import * as DOGE from '../../doge'
import * as ETH from '../../ethereum'
import * as LTC from '../../litecoin'
import * as THOR from '../../thorchain'
import { ApiError, ErrorId, TxHashLD, TxLD } from '../../wallet/types'
import { SendPoolTxParams, SendTxParams } from '../types'

// helper to create `RemoteData<ApiError, never>` observable
const txFailure$ = (msg: string): LiveData<ApiError, never> =>
  Rx.of(
    RD.failure({
      errorId: ErrorId.SEND_TX,
      msg
    })
  )

export const sendTx$ = ({
  walletType,
  asset,
  sender,
  recipient,
  amount,
  memo,
  feeOption = DEFAULT_FEE_OPTION,
  walletIndex
}: SendTxParams): TxHashLD => {
  switch (asset.chain) {
    case BNBChain:
      return BNB.sendTx({ walletType, sender, recipient, amount, asset, memo, walletIndex })

    case BTCChain:
      return FP.pipe(
        BTC.feesWithRates$(memo),
        liveData.mapLeft((error) => ({
          errorId: ErrorId.GET_FEES,
          msg: error?.message ?? error.toString()
        })),
        liveData.chain(({ rates }) =>
          BTC.sendTx({ walletType, recipient, amount, feeRate: rates[feeOption], memo, walletIndex, sender })
        )
      )

    case ETHChain:
      return ETH.sendTx({ asset, recipient, amount, memo, feeOption, walletIndex })

    case THORChain:
      return THOR.sendTx({ walletType, amount, asset, memo, recipient, walletIndex })

    case CosmosChain:
      // not available yet
      return txFailure$(`sendTx$ has not been implemented for Cosmos yet`)

    case PolkadotChain:
      // not available yet
      return txFailure$(`sendTx$ has not been implemented for Polkadot yet`)

    case TerraChain:
      // not available yet
      return txFailure$(`sendTx$ has not been implemented for Luna/Terra yet`)

    case DOGEChain:
      return FP.pipe(
        DOGE.feesWithRates$(memo),
        // Error -> ApiError
        liveData.mapLeft((error) => ({
          errorId: ErrorId.GET_FEES,
          msg: error?.message ?? error.toString()
        })),
        liveData.chain(({ rates }) =>
          DOGE.sendTx({ walletType, recipient, amount, feeRate: rates[feeOption], memo, walletIndex, sender })
        )
      )

    case BCHChain:
      return FP.pipe(
        BCH.feesWithRates$(memo),
        liveData.mapLeft((error) => ({
          errorId: ErrorId.GET_FEES,
          msg: error?.message ?? error.toString()
        })),
        liveData.chain(({ rates }) =>
          BCH.sendTx({ walletType, recipient, amount, feeRate: rates[feeOption], memo, walletIndex, sender })
        )
      )
    case LTCChain:
      return FP.pipe(
        LTC.feesWithRates$(memo),
        liveData.mapLeft((error) => ({
          errorId: ErrorId.GET_FEES,
          msg: error?.message ?? error.toString()
        })),
        liveData.chain(({ rates }) => {
          return LTC.sendTx({ walletType, recipient, amount, feeRate: rates[feeOption], memo, walletIndex, sender })
        })
      )
  }
}

export const sendPoolTx$ = ({
  sender,
  walletType,
  walletIndex,
  router,
  asset,
  recipient,
  amount,
  memo,
  feeOption = DEFAULT_FEE_OPTION
}: SendPoolTxParams): TxHashLD => {
  switch (asset.chain) {
    case ETHChain:
      // TODO(@asgdx-team) Support `walletType`to provide Ledger & Co.
      return ETH.sendPoolTx$({
        router,
        recipient,
        asset,
        amount,
        memo,
        walletIndex
      })

    case THORChain:
      return THOR.sendPoolTx$({ walletType, amount, asset, memo, walletIndex })

    default:
      return sendTx$({ sender, walletType, asset, recipient, amount, memo, feeOption, walletIndex })
  }
}

// helper to create `RemoteData<ApiError, never>` observable
const txStatusFailure$ = (msg: string): LiveData<ApiError, never> =>
  Rx.of(
    RD.failure({
      errorId: ErrorId.GET_TX,
      msg
    })
  )

export const txStatusByChain$ = ({ txHash, chain }: { txHash: TxHash; chain: Chain }): TxLD => {
  switch (chain) {
    case BNBChain:
      return BNB.txStatus$(txHash, O.none)
    case BTCChain:
      return BTC.txStatus$(txHash, O.none)
    case ETHChain:
      return ETH.txStatus$(txHash, O.none)
    case THORChain:
      return THOR.txStatus$(txHash, O.none)
    case CosmosChain:
      return txStatusFailure$(`txStatusByChain$ has not been implemented for Cosmos`)
    case PolkadotChain:
      return txStatusFailure$(`txStatusByChain$ has not been implemented for Polkadot`)
    case TerraChain:
      return txStatusFailure$(`txStatusByChain$ has not been implemented for Luna`)
    case DOGEChain:
      return DOGE.txStatus$(txHash, O.none)
    case BCHChain:
      return BCH.txStatus$(txHash, O.none)
    case LTCChain:
      return LTC.txStatus$(txHash, O.none)
  }
}

export const poolTxStatusByChain$ = ({
  txHash,
  chain,
  assetAddress: oAssetAddress
}: {
  txHash: TxHash
  chain: Chain
  assetAddress: O.Option<Address>
}): TxLD => {
  switch (chain) {
    case ETHChain:
      return ETH.txStatus$(txHash, oAssetAddress)
    default:
      return txStatusByChain$({ txHash, chain })
  }
}
