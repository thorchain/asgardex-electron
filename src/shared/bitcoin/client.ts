import { ClientUrl } from '@xchainjs/xchain-bitcoin'

import { envOrDefault } from '../utils/env'

export const getHaskoinApiUrl = (): ClientUrl => {
  const APP_HASKOIN_MAINNET_URL = envOrDefault(
    process.env.REACT_APP_HASKOIN_BTC_MAINNET_URL,
    'https://haskoin.ninerealms.com/btc'
  )

  return {
    testnet: envOrDefault(process.env.REACT_APP_HASKOIN_BTC_TESTNET_URL, 'https://haskoin.ninerealms.com/btctest'),
    stagenet: APP_HASKOIN_MAINNET_URL,
    mainnet: APP_HASKOIN_MAINNET_URL
  }
}
