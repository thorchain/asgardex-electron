import * as RD from '@devexperts/remote-data-ts'
import { Asset, BaseAmount, Chain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { LiveData } from '../../helpers/rx/liveData'
import {
  Network as NetworkInfo,
  Constants as ThorchainConstants,
  LastblockItem,
  InboundAddressesItem as ThorchainEndpoint,
  PoolDetail as MidgardPoolDetail,
  Health
} from '../../types/generated/midgard'
import { PricePools, PricePoolAsset, PricePool } from '../../views/pools/Pools.types'
import { ApiError } from '../wallet/types'

export type ThorchainLastblock = LastblockItem[]

export type PoolAsset = string

export type PoolAssets = Asset[]
export type PoolAssetsRD = RD.RemoteData<Error, PoolAssets>
export type PoolAssetsLD = LiveData<Error, PoolAssets>

export type AssetDetail = {
  asset: string
  dateCreated: number
  priceRune: string
}

export interface StakersAssetData {
  /**
   * Asset
   * @type {string}
   */
  asset?: string
  /**
   * Total of assets staked
   * @type {string}
   */
  assetStaked?: string
  /**
   * Total of assets withdrawn
   * @type {string}
   */
  assetWithdrawn?: string
  /**
   * @type {number}
   */
  dateFirstStaked?: number
  /**
   * @type {number}
   */
  heightLastStaked?: number
  /**
   * Total of rune staked
   * @type {string}
   */
  runeStaked?: string
  /**
   * Total of rune withdrawn
   * @type {string}
   */
  runeWithdrawn?: string
  /**
   * Represents ownership of a pool.
   * @type {string}
   */
  units?: string
}

export type AssetDetails = AssetDetail[]
export type AssetDetailsRD = RD.RemoteData<Error, AssetDetails>
export type AssetDetailsLD = LiveData<Error, AssetDetails>

export type AssetDetailMap = {
  [key in Chain]: AssetDetail
}

export type PoolDetail = MidgardPoolDetail & {
  poolSlipAverage: string
  swappingTxCount: string
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
  poolAssets: PoolAssets
  poolDetails: PoolDetails
  pricePools: O.Option<PricePools>
}
export type PoolsStateRD = RD.RemoteData<Error, PoolsState>
export type PoolsStateLD = LiveData<Error, PoolsState>

export type PendingPoolsState = {
  assetDetails: AssetDetails
  poolAssets: PoolAssets
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

export type ThorchainEndpoints = ThorchainEndpoint[]
export type ThorchainEndpointsLD = LiveData<Error, ThorchainEndpoints>

export type PoolAddress = string
export type PoolAddressRx = Rx.Observable<O.Option<PoolAddress>>
export type PoolAddressRD = RD.RemoteData<Error, PoolAddress>

export type NetworkInfoRD = RD.RemoteData<Error, NetworkInfo>
export type NetworkInfoLD = LiveData<Error, NetworkInfo>

export type ByzantineLD = LiveData<Error, string>

export type HealthRD = RD.RemoteData<Error, Health>
export type HealthLD = LiveData<Error, Health>

export type PoolsService = {
  poolsState$: LiveData<Error, PoolsState>
  pendingPoolsState$: LiveData<Error, PendingPoolsState>
  setSelectedPricePoolAsset: (asset: PricePoolAsset) => void
  selectedPricePoolAsset$: Rx.Observable<SelectedPricePoolAsset>
  selectedPricePool$: Rx.Observable<SelectedPricePool>
  selectedPricePoolAssetSymbol$: Rx.Observable<O.Option<string>>
  reloadPools: () => void
  poolAddresses$: ThorchainEndpointsLD
  selectedPoolAddress$: PoolAddressRx
  poolAddressByAsset$: (asset: Asset) => PoolAddressRx
  poolDetail$: PoolDetailLD
  priceRatio$: Rx.Observable<BigNumber>
  availableAssets$: PoolAssetsLD
  validatePool$: (poolAddress: string, chain: Chain) => ValidatePoolLD
}

export type StakersAssetDataRD = RD.RemoteData<Error, StakersAssetData>
export type StakersAssetDataLD = LiveData<Error, StakersAssetData>

export type ValidatePoolRD = RD.RemoteData<ApiError, boolean>
export type ValidatePoolLD = LiveData<ApiError, boolean>

export type ValidateNodeRD = RD.RemoteData<ApiError, boolean>
export type ValidateNodeLD = LiveData<ApiError, boolean>
