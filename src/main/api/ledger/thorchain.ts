import Transport from '@ledgerhq/hw-transport'
import THORChainApp from '@thorchain/ledger-thorchain'
import { getPrefix } from '@xchainjs/xchain-thorchain'
import * as E from 'fp-ts/Either'

import { Network } from '../../../shared/api/types'
import { toClientNetwork } from '../../../shared/utils/utils'
import { getPath } from './common'
import { getErrorId } from './utils'

export const getAddress = async ({
  transport,
  network,
  index
}: {
  transport: Transport
  network: Network
  index: number
}) => {
  try {
    const app = new THORChainApp(transport)
    const clientNetwork = toClientNetwork(network)
    const prefix = getPrefix(clientNetwork)
    const res = await app.getAddressAndPubKey(getPath(index), prefix)
    if (!res.bech32_address || res.return_code !== 0x9000 /* ERROR_CODE.NoError */) {
      return E.left(res.return_code.toString())
    }
    return E.right(res.bech32_address)
  } catch (error) {
    return E.left(getErrorId(error))
  }
}
