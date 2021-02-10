import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { BNBChain, BTCChain, Chain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerBNCTxInfo, LedgerBTCTxInfo, LedgerErrorId, LedgerTxInfo, Network } from '../../../shared/api/types'
import { sendTx as sendBNCTx } from './binance'
import { sendTx as sendBTCTx } from './bitcoin'
import { getErrorId } from './utils'

export const sendTx = async (
  chain: Chain,
  network: Network,
  txInfo: LedgerTxInfo
): Promise<E.Either<LedgerErrorId, string>> => {
  try {
    const transport = await TransportNodeHid.open('')
    let res: E.Either<LedgerErrorId, string>
    switch (chain) {
      case BNBChain:
        res = await sendBNCTx(transport, network, txInfo as LedgerBNCTxInfo)
        break
      case BTCChain:
        res = await sendBTCTx(transport, network, txInfo as LedgerBTCTxInfo)
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
