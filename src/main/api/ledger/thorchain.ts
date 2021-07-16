import Transport from '@ledgerhq/hw-transport'
import THORChainApp from '@thorchain/ledger-thorchain'
import * as Client from '@xchainjs/xchain-client'
import { getPrefix } from '@xchainjs/xchain-thorchain'
import * as E from 'fp-ts/Either'

import { LedgerErrorId, Network } from '../../../shared/api/types'
import { getErrorId } from './utils'

// TODO(@Veado) Move `toClientNetwork` from `renderer/services/clients` to `main/util` or so
const toClientNetwork = (network: Network): Client.Network =>
  network === 'mainnet' ? Client.Network.Mainnet : Client.Network.Testnet
// TODO(@veado) Get path by using `xchain-thorchain`
const PATH = [44, 931, 0, 0, 0]

export const getAddress = async (transport: Transport, network: Network) => {
  try {
    const app = new THORChainApp(transport)
    const clientNetwork = toClientNetwork(network)
    const response = await app.getAddressAndPubKey(PATH, getPrefix(clientNetwork))
    if (response.return_code !== 0x9000) {
      // TODO(@Veado) get address from pubkey
      return E.right('my-address')
    } else {
      return E.left(LedgerErrorId.UNKNOWN)
    }
  } catch (error) {
    return E.left(getErrorId(error.toString()))
  }
}
