import { Client as BnbClient } from '@xchainjs/xchain-binance'

/**
 * Check whether client is Bnb chain
 */
export const isBnbClient = (client: unknown): client is BnbClient => client instanceof BnbClient
