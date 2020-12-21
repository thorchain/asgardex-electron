import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { LedgerTxInfo as LedgerBTCTxInfo } from '@xchainjs/xchain-bitcoin'
import { BNBChain, BTCChain, Chain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerBNCTxInfo, LedgerErrorId, LedgerTxInfo, Network } from '../../../shared/api/types'
import { sendTx as sendBNCTxInLedger } from './binance'
import { signTx as signBTCTxInLedger } from './bitcoin'
import { getErrorId } from './utils'

export const signTx = async (
  chain: Chain,
  network: Network,
  ledgerTxInfo: LedgerTxInfo
): Promise<E.Either<LedgerErrorId, string>> => {
  try {
    const transport = await TransportNodeHid.open('')
    let res: E.Either<LedgerErrorId, string>
    switch (chain) {
      case BTCChain:
        res = await signBTCTxInLedger(transport, network, ledgerTxInfo as LedgerBTCTxInfo)
        break
      default:
        res = E.left(LedgerErrorId.NO_APP)
    }
    await transport.close()
    return res
  } catch (error) {
    return E.left(getErrorId(error.toString()))
  }
}

export const sendTx = async (
  chain: Chain,
  network: Network,
  ledgerTxInfo: LedgerTxInfo
): Promise<E.Either<LedgerErrorId, string>> => {
  try {
    const transport = await TransportNodeHid.open('')
    let res: E.Either<LedgerErrorId, string>
    switch (chain) {
      case BNBChain:
        res = await sendBNCTxInLedger(transport, network, ledgerTxInfo as LedgerBNCTxInfo)
        break
      default:
        res = E.left(LedgerErrorId.NO_APP)
    }
    await transport.close()
    return res
  } catch (error) {
    return E.left(getErrorId(error.toString()))
  }
}
