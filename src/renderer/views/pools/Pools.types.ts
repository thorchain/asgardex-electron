import { PoolData } from '@thorchain/asgardex-util'
import { BaseAmount, Asset, Chain } from '@xchainjs/xchain-util'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'

// import { PoolDetailStatusEnum } from '../../types/generated/midgard'
import { Network } from '../../../shared/api/types'
import { GetPoolsStatusEnum } from '../../types/generated/midgard'

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
  poolPrice: BaseAmount
  status: GetPoolsStatusEnum
  deepest?: boolean
  key: string
  network: Network
}

export type PoolsComponentProps = {
  haltedChains: Chain[]
}
export type PoolTableRowsData = PoolTableRowData[]
