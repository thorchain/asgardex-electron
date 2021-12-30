import * as Client from '@xchainjs/xchain-client'

import { Network } from '../api/types'

export const toClientNetwork = (network: Network): Client.Network => {
  switch (network) {
    case 'mainnet':
      return Client.Network.Mainnet
    case 'stagenet':
      return Client.Network.Stagenet
    case 'testnet':
      return Client.Network.Testnet
  }
}
