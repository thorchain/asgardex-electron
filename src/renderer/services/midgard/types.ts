import * as RD from '@devexperts/remote-data-ts'
import { Asset, Chain } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import { Option } from 'fp-ts/lib/Option'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'

import { LiveData } from '../../helpers/rx/liveData'
import {
  AssetDetail,
  PoolDetail,
  NetworkInfo,
  ThorchainLastblock,
  ThorchainConstants,
  ThorchainEndpoint
} from '../../types/generated/midgard'
import { PricePools, PricePoolAsset } from '../../views/pools/types'

export type PoolAsset = string
export type PoolAssets = string[]

export type AssetDetails = AssetDetail[]

export type AssetDetailMap = {
  [key in Chain]: AssetDetail
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
export type PoolsStateLD = LiveData<Error, PoolsState>

export type ThorchainLastblockRD = RD.RemoteData<Error, ThorchainLastblock>
export type ThorchainLastblockLD = LiveData<Error, ThorchainLastblock>

export type ThorchainConstantsRD = RD.RemoteData<Error, ThorchainConstants>
export type ThorchainConstantsLD = LiveData<Error, ThorchainConstants>

export type ThorchainEndpointsLD = LiveData<Error, ThorchainEndpoint[]>

export type NetworkInfoRD = RD.RemoteData<Error, NetworkInfo>
export type NetworkInfoLD = LiveData<Error, NetworkInfo>

export type ByzantineLD = LiveData<Error, string>

export type PoolDetailLD = LiveData<Error, PoolDetail>

export type PoolsService = {
  poolsState$: LiveData<Error, PoolsState>
  setSelectedPricePool: (asset: PricePoolAsset) => void
  selectedPricePoolAsset$: Rx.Observable<PricePoolAsset>
  selectedPricePoolAssetSymbol$: Rx.Observable<string>
  reloadPoolsState: () => void
  poolAddresses$: ThorchainEndpointsLD
  runeAsset$: Rx.Observable<Asset>
  poolDetailedState$: PoolDetailLD
  reloadPoolDetailedState: (value: O.Option<Asset>) => void
  priceRatio$: Rx.Observable<BigNumber>
}
