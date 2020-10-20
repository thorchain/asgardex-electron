import * as RD from '@devexperts/remote-data-ts'
import { Asset, Chain } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { LiveData } from '../../helpers/rx/liveData'
import {
  AssetDetail,
  PoolDetail,
  NetworkInfo,
  ThorchainLastblock,
  ThorchainConstants,
  ThorchainEndpoint,
  StakersAssetData
} from '../../types/generated/midgard'
import { PricePools, PricePoolAsset, PricePool } from '../../views/pools/Pools.types'

export type PoolAsset = string
export type PoolStringAssets = string[]
export type PoolStringAssetsLD = LiveData<Error, PoolStringAssets>

export type PoolAssets = Asset[]
export type PoolAssetsLD = LiveData<Error, PoolAssets>

export type AssetDetails = AssetDetail[]
export type AssetDetailsLD = LiveData<Error, AssetDetails>

export type AssetDetailMap = {
  [key in Chain]: AssetDetail
}

export type PoolDetailRD = RD.RemoteData<Error, PoolDetail>
export type PoolDetailLD = LiveData<Error, PoolDetail>

export type PoolDetails = PoolDetail[]
export type PoolDetailsLD = LiveData<Error, PoolDetails>

export type PriceDataIndex = {
  [symbol: string]: BigNumber
}

export type PoolsState = {
  assetDetails: AssetDetails
  poolAssets: PoolStringAssets
  poolDetails: PoolDetails
  pricePools: O.Option<PricePools>
}
export type PoolsStateRD = RD.RemoteData<Error, PoolsState>
export type PoolsStateLD = LiveData<Error, PoolsState>

export type SelectedPoolAsset = O.Option<Asset>
export type SelectedPoolChain = O.Option<Chain>

export type SelectedPricePoolAsset = O.Option<PricePoolAsset>

export type SelectedPricePool = PricePool

export type ThorchainLastblockRD = RD.RemoteData<Error, ThorchainLastblock>
export type ThorchainLastblockLD = LiveData<Error, ThorchainLastblock>

export type ThorchainConstantsRD = RD.RemoteData<Error, ThorchainConstants>
export type ThorchainConstantsLD = LiveData<Error, ThorchainConstants>

export type ThorchainEndpointsLD = LiveData<Error, ThorchainEndpoint[]>

export type NetworkInfoRD = RD.RemoteData<Error, NetworkInfo>
export type NetworkInfoLD = LiveData<Error, NetworkInfo>

export type ByzantineLD = LiveData<Error, string>

export type PoolsService = {
  poolsState$: LiveData<Error, PoolsState>
  setSelectedPricePoolAsset: (asset: PricePoolAsset) => void
  selectedPricePoolAsset$: Rx.Observable<SelectedPricePoolAsset>
  selectedPricePool$: Rx.Observable<SelectedPricePool>
  selectedPricePoolAssetSymbol$: Rx.Observable<O.Option<string>>
  reloadPools: () => void
  poolAddresses$: ThorchainEndpointsLD
  runeAsset$: Rx.Observable<Asset>
  poolDetail$: PoolDetailLD
  reloadPoolDetail: () => void
  priceRatio$: Rx.Observable<BigNumber>
  availableAssets$: PoolAssetsLD
}

export type StakersAssetDataRD = RD.RemoteData<Error, StakersAssetData>
export type StakersAssetDataLD = LiveData<Error, StakersAssetData>
