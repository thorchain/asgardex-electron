import TransportNodeHidSingleton from '@ledgerhq/hw-transport-node-hid-singleton'
import { TxHash } from '@xchainjs/xchain-client'
import { THORChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { IPCLedgerDepositTxParams, IPCLedgerSendTxParams } from '../../../shared/api/io'
import { LedgerErrorId } from '../../../shared/api/types'
import * as THOR from './thorchain/transaction'
import { getErrorId } from './utils'

export const sendTx = async ({
  chain,
  network,
  recipient,
  amount,
  memo
}: IPCLedgerSendTxParams): Promise<E.Either<LedgerErrorId, TxHash>> => {
  try {
    const transport = await TransportNodeHidSingleton.open()
    let res: E.Either<LedgerErrorId, string>
    switch (chain) {
      case THORChain:
        res = await THOR.send({ transport, network, recipient, amount, memo })
        break
      default:
        res = E.left(LedgerErrorId.NOT_IMPLEMENTED)
    }
    await transport.close()
    return res
  } catch (error) {
    return E.left(getErrorId(error.toString()))
  }
}

export const deposit = async ({
  chain,
  network,
  amount,
  memo
}: IPCLedgerDepositTxParams): Promise<E.Either<LedgerErrorId, TxHash>> => {
  try {
    const transport = await TransportNodeHidSingleton.open()
    let res: E.Either<LedgerErrorId, string>
    switch (chain) {
      case THORChain:
        res = await THOR.deposit({ transport, network, amount, memo })
        break
      default:
        res = E.left(LedgerErrorId.NOT_IMPLEMENTED)
    }
    await transport.close()
    return res
  } catch (error) {
    return E.left(getErrorId(error.toString()))
  }
}
