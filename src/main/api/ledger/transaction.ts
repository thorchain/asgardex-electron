import TransportNodeHidSingleton from '@ledgerhq/hw-transport-node-hid-singleton'
import { TxHash } from '@xchainjs/xchain-client'
import {
  BCHChain,
  BNBChain,
  BTCChain,
  chainToString,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { IPCLedgerDepositTxParams, IPCLedgerSendTxParams } from '../../../shared/api/io'
import { LedgerError, LedgerErrorId } from '../../../shared/api/types'
import { isError, isEthHDMode } from '../../../shared/utils/guard'
import * as BNB from './binance/transaction'
import * as BTC from './bitcoin/transaction'
import * as BCH from './bitcoincash/transaction'
import * as COSMOS from './cosmos/transaction'
import * as DOGE from './doge/transaction'
import * as ETH from './ethereum/transaction'
import * as LTC from './litecoin/transaction'
import * as THOR from './thorchain/transaction'

export const sendTx = async ({
  chain,
  network,
  sender,
  recipient,
  amount,
  asset,
  feeAmount,
  memo,
  feeRate,
  feeOption,
  walletIndex,
  nodeUrl,
  hdMode
}: IPCLedgerSendTxParams): Promise<E.Either<LedgerError, TxHash>> => {
  try {
    const transport = await TransportNodeHidSingleton.open()
    let res: E.Either<LedgerError, string>
    switch (chain) {
      case THORChain:
        if (!nodeUrl) {
          res = E.left({
            errorId: LedgerErrorId.INVALID_DATA,
            msg: `"nodeUrl" needs to be defined to send Ledger transaction on ${chainToString(chain)}`
          })
        } else {
          res = await THOR.send({
            transport,
            network,
            recipient,
            amount,
            memo,
            walletIndex,
            nodeUrl
          })
        }
        break
      case BNBChain:
        res = await BNB.send({
          transport,
          network,
          sender,
          recipient,
          amount,
          asset,
          memo,
          walletIndex
        })
        break
      case BTCChain:
        res = await BTC.send({
          transport,
          network,
          sender,
          recipient,
          amount,
          feeRate,
          memo,
          walletIndex
        })
        break
      case LTCChain:
        res = await LTC.send({
          transport,
          network,
          sender,
          recipient,
          amount,
          feeRate,
          memo,
          walletIndex
        })
        break
      case BCHChain:
        res = await BCH.send({ transport, network, sender, recipient, amount, feeRate, memo, walletIndex })
        break
      case DOGEChain:
        res = await DOGE.send({
          transport,
          network,
          sender,
          recipient,
          amount,
          feeRate,
          memo,
          walletIndex
        })
        break
      case ETHChain:
        if (!asset) {
          res = E.left({
            errorId: LedgerErrorId.INVALID_DATA,
            msg: `Asset needs to be defined to send Ledger transaction on ${chainToString(chain)}`
          })
        } else if (!feeOption) {
          res = E.left({
            errorId: LedgerErrorId.INVALID_DATA,
            msg: `Fee option needs to be set to send Ledger transaction on ${chainToString(chain)}`
          })
        } else if (!isEthHDMode(hdMode)) {
          res = E.left({
            errorId: LedgerErrorId.INVALID_DATA,
            msg: `Invalid EthHDMode set - needed to send Ledger transaction on ${chainToString(chain)}`
          })
        } else {
          res = await ETH.send({
            asset,
            transport,
            network,
            recipient,
            amount,
            memo,
            walletIndex,
            feeOption,
            ethHDMode: hdMode
          })
        }
        break
      case CosmosChain:
        if (!asset) {
          res = E.left({
            errorId: LedgerErrorId.INVALID_DATA,
            msg: `Asset needs to be defined to send Ledger transaction on ${chainToString(chain)}`
          })
        } else if (!feeAmount) {
          res = E.left({
            errorId: LedgerErrorId.INVALID_DATA,
            msg: `Fee amount needs to be defined to send Ledger transaction on ${chainToString(chain)}`
          })
        } else {
          res = await COSMOS.send({
            transport,
            network,
            amount,
            asset,
            recipient,
            memo,
            walletIndex,
            feeAmount
          })
        }
        break
      default:
        res = E.left({
          errorId: LedgerErrorId.NOT_IMPLEMENTED,
          msg: `'sendTx' for ${chain} has not been implemented`
        })
    }
    await transport.close()
    return res
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.SEND_TX_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}

export const deposit = async ({
  chain,
  network,
  asset,
  router,
  recipient,
  amount,
  memo,
  walletIndex,
  feeOption,
  nodeUrl,
  hdMode
}: IPCLedgerDepositTxParams): Promise<E.Either<LedgerError, TxHash>> => {
  try {
    const transport = await TransportNodeHidSingleton.open()
    let res: E.Either<LedgerError, string>
    switch (chain) {
      case THORChain:
        if (!nodeUrl) {
          res = E.left({
            errorId: LedgerErrorId.INVALID_DATA,
            msg: `"nodeUrl" needs to be defined to send Ledger transaction on ${chainToString(chain)}`
          })
        } else {
          res = await THOR.deposit({ transport, network, amount, memo, walletIndex, nodeUrl })
        }
        break
      case ETHChain:
        if (!router) {
          return E.left({
            errorId: LedgerErrorId.INVALID_DATA,
            msg: `Router address needs to be defined to send Ledger transaction  on ${chainToString(chain)}`
          })
        } else if (!asset) {
          res = E.left({
            errorId: LedgerErrorId.INVALID_DATA,
            msg: `Asset needs to be defined to send Ledger transaction on ${chainToString(chain)}`
          })
        } else if (!recipient) {
          res = E.left({
            errorId: LedgerErrorId.INVALID_DATA,
            msg: `Recipient needs to be defined to send Ledger transaction on ${chainToString(chain)}`
          })
        } else if (!feeOption) {
          res = E.left({
            errorId: LedgerErrorId.INVALID_DATA,
            msg: `Fee option needs to be defined to send Ledger transaction on ${chainToString(chain)}`
          })
        } else if (!isEthHDMode(hdMode)) {
          res = E.left({
            errorId: LedgerErrorId.INVALID_DATA,
            msg: `Invalid EthHDMode set - needed to send Ledger transaction on ${chainToString(chain)}`
          })
        } else {
          res = await ETH.deposit({
            asset,
            router,
            transport,
            network,
            amount,
            memo,
            walletIndex,
            recipient,
            feeOption,
            ethHDMode: hdMode
          })
        }
        break
      default:
        res = E.left({
          errorId: LedgerErrorId.NOT_IMPLEMENTED,
          msg: `'deposit' for ${chain} has not been implemented`
        })
    }
    await transport.close()
    return res
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.DEPOSIT_TX_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}
