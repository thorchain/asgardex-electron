import { Network } from '@xchainjs/xchain-client'
import { ChainIds, ClientUrls } from '@xchainjs/xchain-cosmos'

const clientUrl = 'https://lcd-cosmos.cosmostation.io'

export const getClientUrls = (): ClientUrls => ({
  [Network.Stagenet]: clientUrl,
  [Network.Mainnet]: clientUrl,
  [Network.Testnet]: 'https://rest.sentry-01.theta-testnet.polypore.xyz'
})

/**
 * Default Cosmos' chain ids
 *
 * Note: All are 'unknown' by default
 * They need to be requested from Cosmos API
 * just before initializing a `xchain-cosmos` client
 */
export const INITIAL_CHAIN_IDS: ChainIds = {
  [Network.Mainnet]: 'unkown-mainnet-chain-id',
  [Network.Stagenet]: 'unkown-stagenet-chain-id',
  [Network.Testnet]: 'unkown-testnet-chain-id'
}
