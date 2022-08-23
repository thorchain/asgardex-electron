import { Network } from '@xchainjs/xchain-client'
import { ChainIds, ClientUrls } from '@xchainjs/xchain-cosmos'

import { envOrDefault } from '../utils/env'

// expose env (needed to access ENVs by `envOrDefault`) in `main` thread)
require('dotenv').config()

const MAINNET_LCD = envOrDefault(process.env.REACT_APP_COSMOS_MAINNET_LCD, 'https://lcd-cosmoshub.keplr.app')

export const getClientUrls = (): ClientUrls => ({
  [Network.Stagenet]: MAINNET_LCD,
  [Network.Mainnet]: MAINNET_LCD,
  [Network.Testnet]: 'https://rest.sentry-01.theta-testnet.polypore.xyz'
})

const mainChainId = 'cosmoshub-4'
/**
 * Default Cosmos' chain ids
 *
 * Note: All 'unknown' will be fetched from Cosmos `node_info`` endpoint
 * just before initializing a `xchain-cosmos` client
 */
export const INITIAL_CHAIN_IDS: ChainIds = {
  [Network.Mainnet]: mainChainId, // can't be fetched for `lcd-cosmoshub.keplr.app`
  [Network.Stagenet]: mainChainId, // can't be fetched for `lcd-cosmoshub.keplr.app`
  [Network.Testnet]: 'unkown-testnet-chain-id' // will be fetched
}
