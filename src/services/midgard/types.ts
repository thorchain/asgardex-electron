import * as RD from '@devexperts/remote-data-ts'

import { AssetDetail, PoolDetail, NetworkInfo } from '../../types/generated/midgard'

export type PoolAsset = string
export type PoolAssets = string[]

export type AssetDetails = AssetDetail[]

export type AssetDetailMap = {
  [asset: string]: AssetDetail
}

export type PoolDetails = PoolDetail[]

export type Asset = {
  chain?: string
  symbol?: string
  ticker?: string
}

export type PoolsState = {
  assetDetails: AssetDetails
  poolAssets: PoolAssets
  poolDetails: PoolDetails
}

export type PoolsStateRD = RD.RemoteData<Error, PoolsState>

export type NetworkInfoRD = RD.RemoteData<Error, NetworkInfo>
