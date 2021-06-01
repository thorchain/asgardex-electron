import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import { BaseAmount, Asset, Chain } from '@xchainjs/xchain-util'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import * as Rx from 'rxjs'

import { Network } from '../../../shared/api/types'
import { LiveData } from '../../helpers/rx/liveData'
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
  asset: PricePoolAsset
  poolData: PoolData
}

export type PricePool$ = Rx.Observable<PricePool>
export type PricePoolRD = RD.RemoteData<Error, PricePool>
export type PricePoolLD = LiveData<Error, PricePool>

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
