import * as RD from '@devexperts/remote-data-ts'
import BigNumber from 'bignumber.js'
import { Option } from 'fp-ts/lib/Option'

import {
  AssetDetail,
  PoolDetail,
  NetworkInfo,
  ThorchainLastblock,
  ThorchainConstants
} from '../../types/generated/midgard'
import { PricePools, PricePoolAsset } from '../../views/pools/types'

export type PoolAsset = string
export type PoolAssets = string[]

export type AssetDetails = AssetDetail[]

export type AssetDetailMap = {
  [asset: string]: AssetDetail
}

export type PoolDetails = PoolDetail[]

export type PriceDataIndex = {
  [symbol: string]: BigNumber
}

export type PoolsState = {
  assetDetails: AssetDetails
  poolAssets: PoolAssets
  poolDetails: PoolDetails
  pricePools: Option<PricePools>
}

export type SelectedPricePoolAsset = Option<PricePoolAsset>
export type PoolsStateRD = RD.RemoteData<Error, PoolsState>

export type ThorchainLastblockRD = RD.RemoteData<Error, ThorchainLastblock>

export type ThorchainConstantsRD = RD.RemoteData<Error, ThorchainConstants>

export type NetworkInfoRD = RD.RemoteData<Error, NetworkInfo>
