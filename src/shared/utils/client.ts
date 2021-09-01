import * as Client from '@xchainjs/xchain-client'

import { Network } from '../api/types'

export const toClientNetwork = (network: Network): Client.Network =>
  network === 'mainnet' ? Client.Network.Mainnet : Client.Network.Testnet
