import * as RD from '@devexperts/remote-data-ts'
import { Asset, BaseAmount, Chain } from '@xchainjs/xchain-util'
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
export type PoolAssetsRD = RD.RemoteData<Error, PoolAssets>
export type PoolAssetsLD = LiveData<Error, PoolAssets>

export type AssetDetails = AssetDetail[]
export type AssetDetailsRD = RD.RemoteData<Error, AssetDetails>
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

export type PendingPoolsState = {
  assetDetails: AssetDetails
  poolAssets: PoolStringAssets
  poolDetails: PoolDetails
}
export type PendingPoolsStateRD = RD.RemoteData<Error, PendingPoolsState>
export type PendingPoolsStateLD = LiveData<Error, PendingPoolsState>

export type SelectedPoolAsset = O.Option<Asset>
export type SelectedPoolChain = O.Option<Chain>

export type SelectedPricePoolAsset = O.Option<PricePoolAsset>

export type SelectedPricePool = PricePool

export type ThorchainLastblockRD = RD.RemoteData<Error, ThorchainLastblock>
export type ThorchainLastblockLD = LiveData<Error, ThorchainLastblock>

export type ThorchainConstantsRD = RD.RemoteData<Error, ThorchainConstants>
export type ThorchainConstantsLD = LiveData<Error, ThorchainConstants>

export type NativeFee = O.Option<BaseAmount>
export type NativeFeeRD = RD.RemoteData<Error, NativeFee>
export type NativeFeeLD = LiveData<Error, NativeFee>

export type ThorchainEndpointsLD = LiveData<Error, ThorchainEndpoint[]>

export type PoolAddress = string
export type PoolAddressRx = Rx.Observable<O.Option<PoolAddress>>

export type NetworkInfoRD = RD.RemoteData<Error, NetworkInfo>
export type NetworkInfoLD = LiveData<Error, NetworkInfo>

export type ByzantineLD = LiveData<Error, string>

export type PoolsService = {
  poolsState$: LiveData<Error, PoolsState>
  pendingPoolsState$: LiveData<Error, PendingPoolsState>
  setSelectedPricePoolAsset: (asset: PricePoolAsset) => void
  selectedPricePoolAsset$: Rx.Observable<SelectedPricePoolAsset>
  selectedPricePool$: Rx.Observable<SelectedPricePool>
  selectedPricePoolAssetSymbol$: Rx.Observable<O.Option<string>>
  reloadPools: () => void
  reloadPendingPools: () => void
  poolAddresses$: ThorchainEndpointsLD
  poolAddress$: PoolAddressRx
  runeAsset$: Rx.Observable<Asset>
  poolDetail$: PoolDetailLD
  priceRatio$: Rx.Observable<BigNumber>
  availableAssets$: PoolAssetsLD
}

export type StakersAssetDataRD = RD.RemoteData<Error, StakersAssetData>
export type StakersAssetDataLD = LiveData<Error, StakersAssetData>
