import { Address } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/function'

import { Network } from '../../../shared/api/types'
import { Client$ } from './types'

export const getBondsService = (client$: Client$, _network$: Network) => {
  const _getNodeInfo = (_nodeAddress: Address) => FP.pipe(client$)
}
