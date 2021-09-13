import TransportNodeHidSingleton from '@ledgerhq/hw-transport-node-hid-singleton'
import { Address } from '@xchainjs/xchain-client'
import { BNBChain, THORChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { isError } from '../../../shared/api/guard'
import { IPCLedgerAdddressParams, LedgerErrorId } from '../../../shared/api/types'
import { getAddress as getBNBAddress } from './binance'
import { getAddress as getTHORAddress } from './thorchain/address'
import { getErrorId } from './utils'

export const getAddress = async ({
  chain,
  network
}: IPCLedgerAdddressParams): Promise<E.Either<LedgerErrorId, Address>> => {
  try {
    let res: E.Either<LedgerErrorId, Address>
    const transport = await TransportNodeHidSingleton.open()
    switch (chain) {
      case THORChain:
        res = await getTHORAddress(transport, network)
        break
      case BNBChain:
        res = await getBNBAddress(transport, network)
        break
      default:
        res = E.left(LedgerErrorId.NO_APP)
    }
    await transport.close()
    return res
  } catch (error) {
    return E.left(getErrorId(isError(error) ? error.message : ''))
  }
}
