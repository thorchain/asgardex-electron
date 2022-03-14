import TransportNodeHidSingleton from '@ledgerhq/hw-transport-node-hid-singleton'
import { TxHash } from '@xchainjs/xchain-client'
import { BCHChain, BNBChain, BTCChain, LTCChain, THORChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { IPCLedgerDepositTxParams, IPCLedgerSendTxParams } from '../../../shared/api/io'
import { LedgerError, LedgerErrorId } from '../../../shared/api/types'
import { isError } from '../../../shared/utils/guard'
import * as BNB from './binance/transaction'
import * as BTC from './bitcoin/transaction'
import * as BCH from './bitcoincash/transaction'
import * as LTC from './litecoin/transaction'
import * as THOR from './thorchain/transaction'

export const sendTx = async ({
  chain,
  network,
  sender,
  recipient,
  amount,
  asset,
  memo,
  feeRate,
  walletIndex
}: IPCLedgerSendTxParams): Promise<E.Either<LedgerError, TxHash>> => {
  try {
    const transport = await TransportNodeHidSingleton.open()
    let res: E.Either<LedgerError, string>
    switch (chain) {
      case THORChain:
        res = await THOR.send({
          transport,
          network,
          recipient,
          amount,
          memo,
          walletIndex
        })
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
        res = await BCH.send({
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
  amount,
  memo,
  walletIndex
}: IPCLedgerDepositTxParams): Promise<E.Either<LedgerError, TxHash>> => {
  try {
    const transport = await TransportNodeHidSingleton.open()
    let res: E.Either<LedgerError, string>
    switch (chain) {
      case THORChain:
        res = await THOR.deposit({ transport, network, amount, memo, walletIndex: walletIndex ? walletIndex : 0 })
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
      errorId: LedgerErrorId.SEND_TX_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}
