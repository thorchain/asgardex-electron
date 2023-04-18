import * as RD from '@devexperts/remote-data-ts'
import { BNBChain } from '@xchainjs/xchain-binance'
import { BTCChain } from '@xchainjs/xchain-bitcoin'
import { BCHChain } from '@xchainjs/xchain-bitcoincash'
import { BSCChain } from '@xchainjs/xchain-bsc'
import { TxHash } from '@xchainjs/xchain-client'
import { GAIAChain } from '@xchainjs/xchain-cosmos'
import { DOGEChain } from '@xchainjs/xchain-doge'
import { ETHChain } from '@xchainjs/xchain-ethereum'
import { LTCChain } from '@xchainjs/xchain-litecoin'
import { MAYAChain } from '@xchainjs/xchain-mayachain'
import { THORChain } from '@xchainjs/xchain-thorchain'
import { Address } from '@xchainjs/xchain-util'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { isEnabledChain } from '../../../../shared/utils/chain'
import { DEFAULT_FEE_OPTION } from '../../../components/wallet/txs/send/Send.const'
import { LiveData, liveData } from '../../../helpers/rx/liveData'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as BCH from '../../bitcoincash'
import * as COSMOS from '../../cosmos'
import * as DOGE from '../../doge'
import * as ETH from '../../ethereum'
import * as LTC from '../../litecoin'
import * as MAYA from '../../maya'
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
  const { chain } = asset

  if (!isEnabledChain(chain)) return txFailure$(`${chain} is not supported for 'sendTx$'`)

  switch (chain) {
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

    case GAIAChain:
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
    case MAYAChain:
      return FP.pipe(
        MAYA.fees$(),
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

    default:
      return txFailure$(`${chain} is not supported for 'sendTx$'`)
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
  const { chain } = asset
  if (!isEnabledChain(chain)) return txFailure$(`${chain} is not supported for 'sendPoolTx$'`)

  switch (chain) {
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

    case BNBChain:
    case BTCChain:
    case BCHChain:
    case DOGEChain:
    case LTCChain:
    case GAIAChain:
    case MAYAChain:
    case BSCChain:
      return sendTx$({ sender, walletType, asset, recipient, amount, memo, feeOption, walletIndex, hdMode })
    default:
      return txFailure$(`${chain} is not supported for 'sendPoolTx$'`)
  }
}

export const txStatusByChain$ = ({ txHash, chain }: { txHash: TxHash; chain: Chain }): TxLD => {
  if (!isEnabledChain(chain)) {
    return Rx.of(
      RD.failure({
        errorId: ErrorId.GET_TX,
        msg: `${chain} is not supported for 'txStatusByChain$'`
      })
    )
  }

  switch (chain) {
    case BNBChain:
      return BNB.txStatus$(txHash, O.none)
    case BTCChain:
      return BTC.txStatus$(txHash, O.none)
    case ETHChain:
      return ETH.txStatus$(txHash, O.none)
    case THORChain:
      return THOR.txStatus$(txHash, O.none)
    case GAIAChain:
      return COSMOS.txStatus$(txHash, O.none)
    case DOGEChain:
      return DOGE.txStatus$(txHash, O.none)
    case BCHChain:
      return BCH.txStatus$(txHash, O.none)
    case LTCChain:
      return LTC.txStatus$(txHash, O.none)
    case MAYAChain:
      return MAYA.txStatus$(txHash, O.none)
    default:
      return Rx.of(
        RD.failure({
          errorId: ErrorId.GET_TX,
          msg: `${chain} is not supported for 'txStatusByChain$'`
        })
      )
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
  if (!isEnabledChain(chain)) {
    return Rx.of(
      RD.failure({
        errorId: ErrorId.GET_TX,
        msg: `${chain} is not supported for 'poolTxStatusByChain$'`
      })
    )
  }

  switch (chain) {
    case ETHChain:
      return ETH.txStatus$(txHash, oAssetAddress)
    case BNBChain:
    case BTCChain:
    case THORChain:
    case GAIAChain:
    case DOGEChain:
    case BCHChain:
    case LTCChain:
      return txStatusByChain$({ txHash, chain })
    default:
      return Rx.of(
        RD.failure({
          errorId: ErrorId.GET_TX,
          msg: `${chain} is not supported for 'poolTxStatusByChain$'`
        })
      )
  }
}
