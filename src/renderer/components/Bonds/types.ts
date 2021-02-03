import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'

import { NodeInfo } from '../../services/thorchain/types'
import { ApiError } from '../../services/wallet/types'

export type NodeDataRD = RD.RemoteData<ApiError, NodeInfo>

export type Node = {
  nodeAddress: Address
  data: NodeDataRD
}
