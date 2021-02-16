import { Address } from '@xchainjs/xchain-client'

import { NodeDataRD } from '../../services/thorchain/types'

export type Node = {
  nodeAddress: Address
  data: NodeDataRD
}
