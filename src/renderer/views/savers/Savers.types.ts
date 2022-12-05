import { BaseAmount, Asset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { Network } from '../../../shared/api/types'

export type SaversTableRowData = {
  asset: Asset
  depthPrice: BaseAmount
  depth: BaseAmount
  filled: BigNumber
  apr: BigNumber
  key: string
  network: Network
  watched: boolean
}

export type SaversTableRowsData = SaversTableRowData[]
