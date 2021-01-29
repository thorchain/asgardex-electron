import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { BaseAmount } from '@xchainjs/xchain-util'

import { ApiError } from '../../services/wallet/types'

export type NodeInfo = {
  bond: BaseAmount
  award: BaseAmount
  status: 'active' | 'standby' | 'disabled'
}

export type NodeDataRD = RD.RemoteData<ApiError, NodeInfo>

export type Node = {
  nodeAddress: Address
  data: NodeDataRD
}
