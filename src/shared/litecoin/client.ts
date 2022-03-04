import { NodeAuth } from '@xchainjs/xchain-litecoin'

import { Network } from '../api/types'
import { envOrDefault } from '../utils/env'

export const getNodeUrl = (network: Network): string => {
  const testnetUrl = envOrDefault(process.env.REACT_APP_LTC_NODE_TESTNET_URL, 'https://testnet.ltc.thorchain.info')
  const mainnetUrl = envOrDefault(process.env.REACT_APP_LTC_NODE_MAINNET_URL, 'https://ltc.thorchain.info')

  return network === 'testnet' ? testnetUrl : mainnetUrl
}

export const getNodeAuth = (): NodeAuth => ({
  password: envOrDefault(process.env.REACT_APP_LTC_NODE_PASSWORD, 'password'),
  username: envOrDefault(process.env.REACT_APP_LTC_NODE_USERNAME, 'thorchain')
})
