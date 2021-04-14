import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import { Address } from '@xchainjs/xchain-client'
import { Asset, BaseAmount, Chain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { LiveData } from '../../helpers/rx/liveData'
import { AssetWithAmount, DepositType } from '../../types/asgardex'
import {
  Network as NetworkInfo,
  Constants as ThorchainConstants,
  LastblockItem,
  PoolDetail,
  Health,
  PoolStatsDetail,
  PoolLegacyDetail,
  LiquidityHistory,
  GetLiquidityHistoryIntervalEnum,
  SwapHistory,
  GetSwapHistoryRequest,
  EarningsHistory,
  EarningsHistoryItemPool,
  GetDepthHistoryRequest,
  DepthHistory,
  DepthHistoryItem,
  SwapHistoryItem
} from '../../types/generated/midgard'
import { PricePools, PricePoolAsset, PricePool } from '../../views/pools/Pools.types'
import { Memo } from '../chain/types'
import { ApiError } from '../wallet/types'

export type PoolAsset = string

export type PoolAssets = Asset[]
export type PoolAssetsRD = RD.RemoteData<Error, PoolAssets>
export type PoolAssetsLD = LiveData<Error, PoolAssets>

export type PoolAssetDetail = {
  asset: Asset
  assetPrice: BigNumber
}

export type PoolAssetDetails = PoolAssetDetail[]
export type PoolAssetDetailsLD = LiveData<Error, PoolAssetDetails>

export type PoolDetailRD = RD.RemoteData<Error, PoolDetail>
export type PoolDetailLD = LiveData<Error, PoolDetail>

export type PoolDetails = PoolDetail[]
export type PoolDetailsLD = LiveData<Error, PoolDetails>

/**
 * Hash map for storing `PoolData` (key: string of asset)
 */
export type PoolsDataMap = Record<string /* asset as string */, PoolData>

export type PriceDataIndex = {
  [symbol: string]: BigNumber
}

export type PoolsState = {
  assetDetails: PoolAssetDetails
  poolAssets: PoolAssets
  poolDetails: PoolDetails
  pricePools: O.Option<PricePools>
}
export type PoolsStateRD = RD.RemoteData<Error, PoolsState>
export type PoolsStateLD = LiveData<Error, PoolsState>

export type PendingPoolsState = {
  assetDetails: PoolAssetDetails
  poolAssets: PoolAssets
  poolDetails: PoolDetails
}
export type PendingPoolsStateRD = RD.RemoteData<Error, PendingPoolsState>
export type PendingPoolsStateLD = LiveData<Error, PendingPoolsState>

export type SelectedPoolAsset = O.Option<Asset>
export type SelectedPoolChain = O.Option<Chain>

export type SelectedPricePoolAsset = O.Option<PricePoolAsset>

export type SelectedPricePool = PricePool

export type LastblockItems = LastblockItem[]
export type ThorchainLastblockRD = RD.RemoteData<Error, LastblockItems>
export type ThorchainLastblockLD = LiveData<Error, LastblockItems>

export type ThorchainConstantsRD = RD.RemoteData<Error, ThorchainConstants>
export type ThorchainConstantsLD = LiveData<Error, ThorchainConstants>

export type NativeFee = O.Option<BaseAmount>
export type NativeFeeRD = RD.RemoteData<Error, NativeFee>
export type NativeFeeLD = LiveData<Error, NativeFee>

/**
 * Type for addresses of a pool
 * A pool has a vault address
 * and in some cases a router address (currently ETH only)
 **/
export type PoolAddress = {
  /** chain */
  chain: Chain
  /** vault address */
  address: Address
  /** router address (optional) */
  router: O.Option<Address>
}
export type PoolAddress$ = Rx.Observable<O.Option<PoolAddress>>
export type PoolAddressRD = RD.RemoteData<Error, PoolAddress>
export type PoolAddressLD = LiveData<Error, PoolAddress>

export type PoolAddresses = PoolAddress[]
export type PoolAddressesLD = LiveData<Error, PoolAddresses>

export type PoolStatsDetailRD = RD.RemoteData<Error, PoolStatsDetail>
export type PoolStatsDetailLD = LiveData<Error, PoolStatsDetail>

export type PoolLegacyDetailRD = RD.RemoteData<Error, PoolLegacyDetail>
export type PoolLegacyDetailLD = LiveData<Error, PoolLegacyDetail>

export type EarningsHistoryRD = RD.RemoteData<Error, EarningsHistory>
export type EarningsHistoryLD = LiveData<Error, EarningsHistory>

export type PoolEarningHistoryRD = RD.RemoteData<Error, O.Option<EarningsHistoryItemPool>>
export type PoolEarningHistoryLD = LiveData<Error, O.Option<EarningsHistoryItemPool>>

export type PoolLiquidityHistoryParams = {
  interval?: GetLiquidityHistoryIntervalEnum
  count?: number
  to?: number
  from?: number
}

export type PoolLiquidityHistoryRD = RD.RemoteData<Error, LiquidityHistory>
export type PoolLiquidityHistoryLD = LiveData<Error, LiquidityHistory>

export type ApiGetSwapHistoryParams = { poolAsset: Asset } & Omit<GetSwapHistoryRequest, 'pool'>
export type GetSwapHistoryParams = Omit<ApiGetSwapHistoryParams, 'poolAsset'>
export type SwapHistoryRD = RD.RemoteData<Error, SwapHistory>
export type SwapHistoryLD = LiveData<Error, SwapHistory>
export type SwapHistoryItems = SwapHistoryItem[]

export type ApiGetDepthHistoryParams = { poolAsset: Asset } & Omit<GetDepthHistoryRequest, 'pool'>
export type GetDepthHistoryParams = Omit<ApiGetDepthHistoryParams, 'poolAsset'>
export type DepthHistoryRD = RD.RemoteData<Error, DepthHistory>
export type DepthHistoryLD = LiveData<Error, DepthHistory>
export type DepthHistoryItems = DepthHistoryItem[]

export type NetworkInfoRD = RD.RemoteData<Error, NetworkInfo>
export type NetworkInfoLD = LiveData<Error, NetworkInfo>

export type ByzantineLD = LiveData<Error, string>

export type HealthRD = RD.RemoteData<Error, Health>
export type HealthLD = LiveData<Error, Health>

export type PoolsService = {
  poolsState$: LiveData<Error, PoolsState>
  pendingPoolsState$: LiveData<Error, PendingPoolsState>
  allPoolDetails$: LiveData<Error, PoolDetails>
  setSelectedPricePoolAsset: (asset: PricePoolAsset) => void
  selectedPricePoolAsset$: Rx.Observable<SelectedPricePoolAsset>
  selectedPricePool$: Rx.Observable<SelectedPricePool>
  selectedPricePoolAssetSymbol$: Rx.Observable<O.Option<string>>
  reloadPools: FP.Lazy<void>
  reloadPendingPools: FP.Lazy<void>
  reloadAllPools: FP.Lazy<void>
  selectedPoolAddress$: PoolAddress$
  poolAddressesByChain$: (chain: Chain) => PoolAddressLD
  reloadPoolAddresses: FP.Lazy<void>
  selectedPoolDetail$: PoolDetailLD
  reloadSelectedPoolDetail: (delay?: number) => void
  reloadPoolStatsDetail: FP.Lazy<void>
  poolStatsDetail$: PoolStatsDetailLD
  poolLegacyDetail$: PoolLegacyDetailLD
  poolEarningHistory$: PoolEarningHistoryLD
  poolLiquidityHistory$: (parmas: PoolLiquidityHistoryParams) => PoolLiquidityHistoryLD
  getSwapHistory$: (params: GetSwapHistoryParams) => SwapHistoryLD
  reloadSwapHistory: FP.Lazy<void>
  getDepthHistory$: (params: GetDepthHistoryParams) => DepthHistoryLD
  reloadDepthHistory: FP.Lazy<void>
  priceRatio$: Rx.Observable<BigNumber>
  availableAssets$: PoolAssetsLD
  validatePool$: (poolAddresses: PoolAddress, chain: Chain) => ValidatePoolLD
  poolsFilters$: Rx.Observable<Record<string, O.Option<PoolFilter>>>
  setPoolsFilter: (poolKey: string, filter: O.Option<PoolFilter>) => void
}

export type PoolShareType = DepositType | 'all'

/**
 * Shares of a pool
 *
 * Note: `BaseAmount`s of `PoolShare` are always `1e8`
 **/
export type PoolShare = {
  units: BigNumber
  asset: Asset
  assetAddedAmount: BaseAmount
  type: PoolShareType
}

export type PoolShareRD = RD.RemoteData<Error, O.Option<PoolShare>>
export type PoolShareLD = LiveData<Error, O.Option<PoolShare>>

export type PoolShares = PoolShare[]

export type PoolSharesRD = RD.RemoteData<Error, PoolShares>
export type PoolSharesLD = LiveData<Error, PoolShares>

export type ValidatePoolLD = LiveData<ApiError, boolean>

export type ValidateNodeLD = LiveData<ApiError, boolean>

export type Tx = {
  // Sender address
  address: string
  values: AssetWithAmount[]
  memo?: Memo
  /**
   * Transaction id hash. Some transactions (such as outbound transactions made in the native asset) may have a zero value.
   */
  txID: string
}

export type TxType =
  | 'DEPOSIT'
  | 'SWAP'
  | 'WITHDRAW'
  | 'DONATE'
  | 'REFUND'
  | 'SWITCH'
  // in case asgardex does not know about any other action type we will display
  // 'unknown' tx type to avoid filtering out any tx
  | 'UNKNOWN'

export type PoolAction = {
  date: Date
  /**
   * Inbound transactions related to the action
   */
  in: Tx[]
  /**
   * Outbound transactions related to the action
   */
  out: Tx[]
  type: TxType
  fees?: AssetWithAmount[]
  slip?: number
}

export type PoolActions = PoolAction[]

export type PoolActionsHistoryPage = {
  total: number
  actions: PoolActions
}

export type PoolActionsHistoryPageRD = RD.RemoteData<ApiError, PoolActionsHistoryPage>

export type PoolActionsHistoryPageLD = LiveData<ApiError, PoolActionsHistoryPage>

export type PoolFilter = Chain | 'base' | 'usd'

export type PoolFilters = PoolFilter[]
