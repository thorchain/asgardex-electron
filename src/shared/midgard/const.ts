import { ApiUrls } from '../api/types'
import { envOrDefault } from '../utils/env'

// expose env (needed to access ENVs by `envOrDefault`) in `main` thread)
require('dotenv').config()

const TESTNET_URL = envOrDefault(process.env.REACT_APP_MIDGARD_TESTNET_URL, 'https://testnet.midgard.thorchain.info')

const STAGENET_URL = envOrDefault(process.env.REACT_APP_MIDGARD_STAGENET_URL, 'https://stagenet-midgard.ninerealms.com')

const MAINNET_URL = envOrDefault(process.env.REACT_APP_MIDGARD_MAINNET_URL, 'https://midgard.ninerealms.com')

export const DEFAULT_MIDGARD_URLS: ApiUrls = {
  mainnet: MAINNET_URL,
  stagenet: STAGENET_URL,
  testnet: TESTNET_URL
}
