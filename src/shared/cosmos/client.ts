import { Network } from '@xchainjs/xchain-client'
import { ChainIds, ClientUrls } from '@xchainjs/xchain-cosmos'

import { envOrDefault } from '../utils/env'

// expose env (needed to access ENVs by `envOrDefault`) in `main` thread)
require('dotenv').config()

const MAINNET_LCD = envOrDefault(process.env.REACT_APP_COSMOS_MAINNET_LCD, 'https://cosmos-lcd.quickapi.com')

export const getClientUrls = (): ClientUrls => ({
  [Network.Stagenet]: MAINNET_LCD,
  [Network.Mainnet]: MAINNET_LCD,
  [Network.Testnet]: 'https://rest.sentry-01.theta-testnet.polypore.xyz'
})

/**
 * Default Cosmos' chain ids
 *
 * Note: All 'unknown' will be fetched from Cosmos `node_info`` endpoint
 * just before initializing a `xchain-cosmos` client
 */
export const INITIAL_CHAIN_IDS: ChainIds = {
  [Network.Mainnet]: 'unkown-mainnet-chain-id', // will be fetched
  [Network.Stagenet]: 'unkown-mainnet-chain-id', // will be fetched
  [Network.Testnet]: 'unkown-testnet-chain-id' // will be fetched
}
