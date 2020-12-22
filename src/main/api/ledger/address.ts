import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { BNBChain, BTCChain, Chain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerErrorId, Network } from '../../../shared/api/types'
import { getAddress as getBNBAddress } from './binance'
import { getAddress as getBTCAddress } from './bitcoin'
import { getErrorId } from './utils'

export const getAddress = async (chain: Chain, network: Network) => {
  try {
    const transport = await TransportNodeHid.open('')
    let res: E.Either<LedgerErrorId, string>
    switch (chain) {
      case BNBChain:
        res = await getBNBAddress(transport, network)
        break
      case BTCChain:
        res = await getBTCAddress(transport, network)
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
