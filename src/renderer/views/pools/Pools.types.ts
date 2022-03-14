import { PoolData } from '@thorchain/asgardex-util'
import { BaseAmount, Asset, Chain } from '@xchainjs/xchain-util'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'

import { Network } from '../../../shared/api/types'
import { MimirHalt } from '../../services/thorchain/types'
import { GetPoolsStatusEnum } from '../../types/generated/midgard'

export type Pool = {
  asset: Asset
  target: Asset
}

// List of assets used for pricing
export type PricePoolAsset = Asset
export type PricePoolAssets = PricePoolAsset[]

export type PricePoolCurrencyWeights = Record<string, number>

// TODO (@asgdx-team) Move all PricePool* types into `src/renderer/services/midgard/types.ts`
export type PricePool = {
  readonly asset: PricePoolAsset
  readonly poolData: PoolData
}

export type PricePools = NonEmptyArray<PricePool>

export type PoolTableRowData = {
  pool: Pool
  depthPrice: BaseAmount
  volumePrice: BaseAmount
  poolPrice: BaseAmount
  apy: number
  status: GetPoolsStatusEnum
  deepest?: boolean
  key: string
  network: Network
}

export type PoolsComponentProps = {
  haltedChains: Chain[]
  mimirHalt: MimirHalt
  walletLocked: boolean
}
export type PoolTableRowsData = PoolTableRowData[]
