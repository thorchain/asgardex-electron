import BigNumber from 'bignumber.js'

import { PoolDetailStatusEnum } from '../../types/generated/midgard'

type PoolRawValueType = {
  depth: BigNumber
  volume: BigNumber
  transaction: BigNumber
  slip: BigNumber
  trade: BigNumber
  poolPrice: BigNumber
}

export type PoolDataType = {
  pool: {
    asset: string
    target: string
  }
  poolPrice: string
  depth: string
  volume: string
  transaction: string
  slip: string
  trade: string
  status: PoolDetailStatusEnum
  raw: PoolRawValueType
  deepest: boolean
}

export type PoolRowType = PoolDataType & { key: number | string }

export type PoolRowTypeList = PoolRowType[]
