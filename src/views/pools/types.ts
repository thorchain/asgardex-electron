import { BaseAmount } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

import { PoolDetailStatusEnum } from '../../types/generated/midgard'

export type Pool = {
  asset: string
  target: string
}

export type PoolTableRowData = {
  pool: Pool
  depthPrice: BaseAmount
  volumePrice: BaseAmount
  transactionPrice: BaseAmount
  poolPrice: BaseAmount
  slip: BigNumber
  trades: BigNumber
  status: PoolDetailStatusEnum
  deepest?: boolean
  key: string
}

export type PoolTableRowsData = PoolTableRowData[]
