import { NodeAuth } from '@xchainjs/xchain-litecoin'

import { envOrDefault } from '../utils/env'
import { Network } from './types'

// expose env (needed to access ENVs by `envOrDefault`) in `main` thread)
require('dotenv').config()

export const getLTCNodeUrl = (network: Network): string => {
  const testnetUrl = envOrDefault(process.env.REACT_APP_LTC_NODE_TESTNET_URL, 'https://testnet.ltc.thorchain.info')
  const mainnetUrl = envOrDefault(process.env.REACT_APP_LTC_NODE_MAINNET_URL, 'https://ltc.thorchain.info')

  return network === 'testnet' ? testnetUrl : mainnetUrl
}

export const getLTCNodeAuth = (): NodeAuth => ({
  password: envOrDefault(process.env.REACT_APP_LTC_NODE_PASSWORD, 'password'),
  username: envOrDefault(process.env.REACT_APP_LTC_NODE_USERNAME, 'thorchain')
})
