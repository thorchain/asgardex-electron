import { PoolData } from '@thorchain/asgardex-util'
import { BaseAmount, Asset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'

import { PoolDetailStatusEnum } from '../../types/generated/midgard'

export type Pool = {
  asset: Asset
  target: Asset
}

// List of assets used for pricing
export type PricePoolAsset = Asset
export type PricePoolAssets = PricePoolAsset[]

export type PricePoolCurrencyWeights = Record<string, number>

export type PricePool = {
  asset: PricePoolAsset
  poolData: PoolData
}

export type PricePools = NonEmptyArray<PricePool>

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
