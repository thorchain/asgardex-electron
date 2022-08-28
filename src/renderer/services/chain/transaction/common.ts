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
import * as COSMOS from '../../cosmos'
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
  walletIndex,
  hdMode
}: SendTxParams): TxHashLD => {
  switch (asset.chain) {
    case BNBChain:
      return BNB.sendTx({ walletType, sender, recipient, amount, asset, memo, walletIndex, hdMode })

    case BTCChain:
      return FP.pipe(
        BTC.feesWithRates$(memo),
        liveData.mapLeft((error) => ({
          errorId: ErrorId.GET_FEES,
          msg: error?.message ?? error.toString()
        })),
        liveData.chain(({ rates }) =>
          BTC.sendTx({ walletType, recipient, amount, feeRate: rates[feeOption], memo, walletIndex, hdMode, sender })
        )
      )

    case ETHChain:
      return ETH.sendTx({ walletType, asset, recipient, amount, memo, feeOption, walletIndex, hdMode })

    case THORChain:
      return THOR.sendTx({ walletType, amount, asset, memo, recipient, walletIndex, hdMode })

    case CosmosChain:
      return FP.pipe(
        COSMOS.fees$(),
        liveData.mapLeft((error) => ({
          errorId: ErrorId.GET_FEES,
          msg: error?.message ?? error.toString()
        })),
        liveData.chain((fees) =>
          // fees for COSMOS are FLAT fees for now - different `feeOption` based still on same fee amount
          // If needed, we can change it later to have fee options (similar to Keplr wallet - search for `gasPriceStep` there)
          COSMOS.sendTx({
            walletType,
            sender,
            recipient,
            amount,
            asset,
            memo,
            walletIndex,
            hdMode,
            feeAmount: fees[feeOption]
          })
        )
      )

    case PolkadotChain:
      // not available yet
      return txFailure$(`sendTx$ has not been implemented for Polkadot yet`)

    case TerraChain:
      return txFailure$(`Terra (Classic) is not supported anymore - sendTx$ has been removed`)

    case DOGEChain:
      return FP.pipe(
        DOGE.feesWithRates$(memo),
        // Error -> ApiError
        liveData.mapLeft((error) => ({
          errorId: ErrorId.GET_FEES,
          msg: error?.message ?? error.toString()
        })),
        liveData.chain(({ rates }) =>
          DOGE.sendTx({ walletType, recipient, amount, feeRate: rates[feeOption], memo, walletIndex, hdMode, sender })
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
          BCH.sendTx({ walletType, recipient, amount, feeRate: rates[feeOption], memo, walletIndex, hdMode, sender })
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
          return LTC.sendTx({
            walletType,
            recipient,
            amount,
            feeRate: rates[feeOption],
            memo,
            walletIndex,
            hdMode,
            sender
          })
        })
      )
  }
}

export const sendPoolTx$ = ({
  sender,
  walletType,
  walletIndex,
  hdMode,
  router,
  asset,
  recipient,
  amount,
  memo,
  feeOption = DEFAULT_FEE_OPTION
}: SendPoolTxParams): TxHashLD => {
  switch (asset.chain) {
    case ETHChain:
      return ETH.sendPoolTx$({
        walletType,
        router,
        recipient,
        asset,
        amount,
        memo,
        walletIndex,
        hdMode,
        feeOption
      })

    case THORChain:
      return THOR.sendPoolTx$({ walletType, amount, asset, memo, walletIndex, hdMode })

    default:
      return sendTx$({ sender, walletType, asset, recipient, amount, memo, feeOption, walletIndex, hdMode })
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
      return COSMOS.txStatus$(txHash, O.none)
    case PolkadotChain:
      return txStatusFailure$(`txStatusByChain$ has not been implemented for Polkadot`)
    case TerraChain:
      return txStatusFailure$(`txStatusByChain$ has been removed - Terra (Classic) is not supported anymore`)
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
