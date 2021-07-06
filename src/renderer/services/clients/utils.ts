import * as Client from '@xchainjs/xchain-client'

import { Network } from '../../../shared/api/types'

/**
 * Helper to type cast `Network` (ASGDX) -> `Client.Network` (xchain-client)
 */
export const toClientNetwork = (network: Network): Client.Network => network
