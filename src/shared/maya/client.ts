import { Network } from '@xchainjs/xchain-client'
import { ChainIds, ClientUrl } from '@xchainjs/xchain-mayachain'

import { ApiUrls } from '../api/types'
import { envOrDefault } from '../utils/env'

// expose env (needed to access ENVs by `envOrDefault`) in `main` thread)
require('dotenv').config()

export const DEFAULT_MAYA_RPC_URLS: ApiUrls = {
  mainnet: envOrDefault(process.env.REACT_APP_MAINNET_MAYA_RPC, 'https://tendermint.mayachain.info'),
  stagenet: envOrDefault(process.env.REACT_APP_STAGENET_MAYAE_RPC, 'https://stagenet.tendermint.mayachain.info'),
  testnet: envOrDefault(process.env.REACT_APP_TESTNET_MAYA_RPC, 'deprecated')
}

export const DEFAULT_MAYA_API_URLS: ApiUrls = {
  mainnet: envOrDefault(process.env.REACT_APP_MAINNET_MAYA_API, 'https://mayanode.mayachain.info'),
  stagenet: envOrDefault(process.env.REACT_APP_STAGENET_MAYA_API, 'https://stagenet-thornode.ninerealms.com'),
  testnet: envOrDefault(process.env.REACT_APP_TESTNET_MAYA_API, 'deprecated')
}

export const INITIAL_CHAIN_IDS: ChainIds = {
  [Network.Mainnet]: 'mayachain-mainnet-v1',
  [Network.Stagenet]: 'mayachain-stagenet-v1',
  [Network.Testnet]: 'deprecated'
}

export const DEFAULT_CLIENT_URL: ClientUrl = {
  [Network.Testnet]: {
    node: DEFAULT_MAYA_API_URLS.testnet,
    rpc: DEFAULT_MAYA_RPC_URLS.testnet
  },
  [Network.Stagenet]: {
    node: DEFAULT_MAYA_API_URLS.stagenet,
    rpc: DEFAULT_MAYA_RPC_URLS.stagenet
  },
  [Network.Mainnet]: {
    node: DEFAULT_MAYA_API_URLS.mainnet,
    rpc: DEFAULT_MAYA_RPC_URLS.mainnet
  }
}
