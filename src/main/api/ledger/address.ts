import TransportNodeHidSingleton from '@ledgerhq/hw-transport-node-hid-singleton'
import { Chain, THORChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerErrorId, Network } from '../../../shared/api/types'
import { getAddress as getTHORAddress } from './thorchain'
import { getErrorId } from './utils'

export const getAddress = async (chain: Chain, network: Network): Promise<E.Either<LedgerErrorId, string>> => {
  try {
    let res: E.Either<LedgerErrorId, string>
    const transport = await TransportNodeHidSingleton.open()
    switch (chain) {
      case THORChain:
        res = await getTHORAddress(transport, network)
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
