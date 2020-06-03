import * as RD from '@devexperts/remote-data-ts'
import BigNumber from 'bignumber.js'

import { AssetDetail, PoolDetail } from '../../types/generated/midgard'

export type PoolAsset = string
export type PoolAssets = string[]

export type AssetDetails = AssetDetail[]

export type AssetDetailMap = {
  [asset: string]: AssetDetail
}

export type PoolDetails = PoolDetail[]

/**
 * `PoolDetail[]` transformed as a HashMap
 * Previously `PoolDataMap` in BEPSwap
 */
export type PoolDetailsMap = {
  [symbol: string]: PoolDetail
}

export type PriceDataIndex = {
  [symbol: string]: BigNumber
}

export type Asset = {
  chain?: string
  symbol?: string
  ticker?: string
}

export type PoolsState = {
  assetDetails: AssetDetails
  poolAssets: PoolAssets
  assetDetailIndex: AssetDetailMap
  priceIndex: PriceDataIndex
  poolDetails: PoolDetailsMap
}

export type PoolsStateRD = RD.RemoteData<Error, PoolsState>
