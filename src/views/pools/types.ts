import { AssetAmount } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

import { PoolDetailStatusEnum } from '../../types/generated/midgard'

export type Pool = {
  asset: string
  target: string
}

export type PoolTableRowData = {
  pool: Pool
  depthPrice: AssetAmount
  volumePrice: AssetAmount
  transactionPrice: AssetAmount
  poolPrice: AssetAmount
  slip: BigNumber
  trades: BigNumber
  status: PoolDetailStatusEnum
  deepest?: boolean
  key: string
}

export type PoolTableRowsData = PoolTableRowData[]
