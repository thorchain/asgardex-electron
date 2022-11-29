import { BaseAmount, Asset } from '@xchainjs/xchain-util'

import { Network } from '../../../shared/api/types'

export type SaversTableRowData = {
  asset: Asset
  depthPrice: BaseAmount
  depth: BaseAmount
  filled: number
  count: number
  apr: number
  key: string
  network: Network
  watched: boolean
}

export type SaversTableRowsData = SaversTableRowData[]
