import { ClientUrl } from '@xchainjs/xchain-bitcoin'

import { envOrDefault } from '../utils/env'

export const getHaskoinBTCApiUrl = (): ClientUrl => {
  const mainnetUrl = envOrDefault(process.env.REACT_APP_HASKOIN_BTC_MAINNET_URL, 'https://haskoin.ninerealms.com/btc')

  return {
    testnet: envOrDefault(process.env.REACT_APP_HASKOIN_BTC_TESTNET_URL, 'https://haskoin.ninerealms.com/btctest'),
    stagenet: mainnetUrl,
    mainnet: mainnetUrl
  }
}

export const getHaskoinBCHApiUrl = (): ClientUrl => {
  const APP_HASKOIN_BCH_MAINNET_URL = envOrDefault(
    process.env.REACT_APP_HASKOIN_BCH_MAINNET_URL,
    'https://haskoin.ninerealms.com/bch'
  )

  return {
    testnet: envOrDefault(process.env.REACT_APP_HASKOIN_BCH_TESTNET_URL, 'https://haskoin.ninerealms.com/bchtest'),
    stagenet: APP_HASKOIN_BCH_MAINNET_URL,
    mainnet: APP_HASKOIN_BCH_MAINNET_URL
  }
}
