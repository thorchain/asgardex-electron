import { Network } from '@xchainjs/xchain-client'
import { ClientUrl, getDefaultClientUrl } from '@xchainjs/xchain-thorchain'

import { envOrDefault } from '../utils/env'

export const getClientUrl = (): ClientUrl => {
  const { node: nodeTestnet, rpc: rpcTestnet } = getDefaultClientUrl()[Network.Testnet]
  // TODO: uncomment this when we can update xchainjs
  // const { node: nodeStagenet, rpc: rpcStagenet } = getDefaultClientUrl()[Network.Stagenet]
  const { node: nodeMainnet, rpc: rpcMainnet } = getDefaultClientUrl()[Network.Mainnet]
  return {
    [Network.Testnet]: {
      node: envOrDefault(process.env.REACT_APP_TESTNET_THORNODE_API, nodeTestnet),
      rpc: envOrDefault(process.env.REACT_APP_TESTNET_THORNODE_RPC, rpcTestnet)
    },
    // TODO: uncomment this when we can update xchainjs
    // [Network.Stagenet]: {
    //   node: envOrDefault(process.env.REACT_APP_STAGENET_THORNODE_API, nodeStagenet),
    //   rpc: envOrDefault(process.env.REACT_APP_STAGENET_THORNODE_RPC, rpcStagenet)
    // },
    [Network.Mainnet]: {
      node: envOrDefault(process.env.REACT_APP_MAINNET_THORNODE_API, nodeMainnet),
      rpc: envOrDefault(process.env.REACT_APP_MAINNET_THORNODE_RPC, rpcMainnet)
    }
  }
}
