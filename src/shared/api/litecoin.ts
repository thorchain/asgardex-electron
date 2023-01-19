import { NodeAuth, NodeUrls } from '@xchainjs/xchain-litecoin'

import { envOrDefault } from '../utils/env'
import { Network } from './types'

// expose env (needed to access ENVs by `envOrDefault`) in `main` thread)
require('dotenv').config()

const TESTNET_URL = envOrDefault(process.env.REACT_APP_LTC_NODE_TESTNET_URL, 'https://testnet.ltc.thorchain.info')
const MAINNET_URL = envOrDefault(process.env.REACT_APP_LTC_NODE_MAINNET_URL, 'https://litecoin.ninerealms.com')

export const getLTCNodeUrl = (network: Network): string => (network === 'testnet' ? TESTNET_URL : MAINNET_URL)

export const getLTCNodeUrls = (): NodeUrls => ({
  mainnet: MAINNET_URL,
  stagenet: MAINNET_URL,
  testnet: TESTNET_URL
})

export const getLTCNodeAuth = (): NodeAuth => ({
  password: envOrDefault(process.env.REACT_APP_LTC_NODE_PASSWORD, 'password'),
  username: envOrDefault(process.env.REACT_APP_LTC_NODE_USERNAME, 'thorchain')
})
