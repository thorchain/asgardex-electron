import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import { Chain, THORChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerErrorId, Network } from '../../../shared/api/types'
// import { getAddress as getBNBAddress } from './binance'
// import { getAddress as getBTCAddress } from './bitcoin'
import { getAddress as getTHORAddress } from './thorchain'
import { getErrorId } from './utils'

export const getAddress = async (chain: Chain, network: Network) => {
  try {
    const transport = await TransportWebUSB.create()
    let res: E.Either<LedgerErrorId, string>
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
