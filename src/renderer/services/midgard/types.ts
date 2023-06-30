import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import { TxHash } from '@xchainjs/xchain-client'
import {
  Network as NetworkInfo,
  PoolDetail,
  Health,
  PoolStatsDetail,
  LiquidityHistory,
  SwapHistory,
  EarningsHistory,
  EarningsHistoryItemPool,
  DepthHistory,
  DepthHistoryItem,
  SwapHistoryItem
} from '@xchainjs/xchain-midgard'
import { Address, Asset, BaseAmount, Chain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { IntlShape } from 'react-intl'
import * as Rx from 'rxjs'

import { LiveData } from '../../helpers/rx/liveData'
import { AssetWithAmount, DepositType } from '../../types/asgardex'
import { PricePools, PricePoolAsset, PricePool } from '../../views/pools/Pools.types'
import { Memo, PoolFeeLD } from '../chain/types'
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
export type PoolDetailsRD = RD.RemoteData<Error, PoolDetails>
export type PoolDetailsLD = LiveData<Error, PoolDetails>

/**
 * Hash map for storing `PoolData` (key: string of asset)
 */
export type PoolsDataMap = Record<string /* asset as string */, PoolData>
export type PoolsDataMapRD = RD.RemoteData<Error, PoolsDataMap>

export type PriceDataIndex = {
  [symbol: string]: BigNumber
}

export type PoolsState = {
  assetDetails: PoolAssetDetails
  poolAssets: PoolAssets
  poolDetails: PoolDetails
  poolsData: PoolsDataMap
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

export type PriceRD = RD.RemoteData<Error, AssetWithAmount>

export type MidgardStatusRD = RD.RemoteData<Error, boolean>
export type MidgardStatusLD = LiveData<Error, boolean>

export type HaltedChainsRD = RD.RemoteData<Error, Chain[]>
export type HaltedChainsLD = LiveData<Error, Chain[]>

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
  halted: boolean
}
export type PoolAddress$ = Rx.Observable<O.Option<PoolAddress>>
export type PoolAddressRD = RD.RemoteData<Error, PoolAddress>
export type PoolAddressLD = LiveData<Error, PoolAddress>

export type PoolAddresses = PoolAddress[]
export type PoolAddressesLD = LiveData<Error, PoolAddresses>

export type PoolStatsDetailRD = RD.RemoteData<Error, PoolStatsDetail>
export type PoolStatsDetailLD = LiveData<Error, PoolStatsDetail>

export type EarningsHistoryRD = RD.RemoteData<Error, EarningsHistory>
export type EarningsHistoryLD = LiveData<Error, EarningsHistory>

export type PoolEarningHistoryRD = RD.RemoteData<Error, O.Option<EarningsHistoryItemPool>>
export type PoolEarningHistoryLD = LiveData<Error, O.Option<EarningsHistoryItemPool>>

export type PoolLiquidityHistoryParams = {
  interval?: any
  count?: number
  to?: number
  from?: number
}

export type PoolLiquidityHistoryRD = RD.RemoteData<Error, LiquidityHistory>
export type PoolLiquidityHistoryLD = LiveData<Error, LiquidityHistory>

export type ApiGetSwapHistoryParams = { poolAsset?: Asset } & Omit<GetSwapHistoryRequest, 'pool'>
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

export type MidgardUrlRD = RD.RemoteData<Error, string>
export type MidgardUrlLD = LiveData<Error, string>

export type CheckMidgardUrlLD = LiveData<Error, string>
export type CheckMidgardUrlHandler = (url: string, intl?: IntlShape) => CheckMidgardUrlLD

export type HealthRD = RD.RemoteData<Error, Health>
export type HealthLD = LiveData<Error, Health>

export type PoolType = 'active' | 'pending'

export type PoolsService = {
  setPoolsPeriod: (v: GetPoolsPeriodEnum) => void
  poolsPeriod$: Rx.Observable<GetPoolsPeriodEnum>
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
  selectedPoolDetail$: PoolDetailLD
  reloadSelectedPoolDetail: (delay?: number) => void
  reloadLiquidityHistory: FP.Lazy<void>
  poolStatsDetail$: PoolStatsDetailLD
  reloadPoolStatsDetail: FP.Lazy<void>
  poolEarningHistory$: PoolEarningHistoryLD
  reloadPoolEarningHistory: FP.Lazy<void>
  getPoolLiquidityHistory$: (parmas: PoolLiquidityHistoryParams) => PoolLiquidityHistoryLD
  getSelectedPoolSwapHistory$: (params: GetSwapHistoryParams) => SwapHistoryLD
  apiGetSwapHistory$: (params: ApiGetSwapHistoryParams) => SwapHistoryLD
  apiGetLiquidityHistory$: (params: GetLiquidityHistoryRequest) => PoolLiquidityHistoryLD
  reloadSwapHistory: FP.Lazy<void>
  getDepthHistory$: (params: GetDepthHistoryParams) => DepthHistoryLD
  reloadDepthHistory: FP.Lazy<void>
  priceRatio$: Rx.Observable<BigNumber>
  availableAssets$: PoolAssetsLD
  validatePool$: (poolAddresses: PoolAddress, chain: Chain) => ValidatePoolLD
  poolsFilters$: Rx.Observable<Record<string, O.Option<PoolFilter>>>
  setPoolsFilter: (poolKey: PoolType, filter: O.Option<PoolFilter>) => void
  outboundAssetFeeByChain$: (chain: Chain) => PoolFeeLD
  haltedChains$: HaltedChainsLD
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
  assetAddress: O.Option<Address>
  runeAddress: O.Option<Address>
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

export type Action = {
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

export type Actions = Action[]

export type ActionsPage = {
  total: number
  actions: Actions
}

export type ActionsPageRD = RD.RemoteData<ApiError, ActionsPage>
export type ActionsPageLD = LiveData<ApiError, ActionsPage>

const staticPoolFilters = ['__base__', '__usd__', '__bep2__', '__erc20__', '__watched__'] as const
export type StaticPoolFilter = typeof staticPoolFilters[number]

/**
 * Type guard for `StaticPoolFilters`
 */
export const isStaticPoolFilter = (v: unknown): v is StaticPoolFilter =>
  typeof v === 'string' ? staticPoolFilters.includes(v as StaticPoolFilter) : false

export type PoolFilter = StaticPoolFilter | string
export type PoolFilters = PoolFilter[]
export const DEFAULT_POOL_FILTERS: PoolFilters = ['__watched__', '__base__', '__usd__', '__bep2__', '__erc20__']

export type LoadActionsParams = {
  page: number
  addresses?: Address[]
  txid?: TxHash
  asset?: string
  type?: TxType | 'ALL'
  itemsPerPage: number
}
