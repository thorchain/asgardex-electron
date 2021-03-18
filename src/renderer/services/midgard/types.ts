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

export type PoolAssetDetail = {
  asset: Asset
  assetPrice: BigNumber
}

export type PoolAssetDetails = PoolAssetDetail[]
export type PoolAssetDetailsLD = LiveData<Error, PoolAssetDetails>

export type PoolDetail = MidgardPoolDetail & {
  poolSlipAverage: string
  swappingTxCount: string
}

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

export type ThorchainLastblockRD = RD.RemoteData<Error, ThorchainLastblock>
export type ThorchainLastblockLD = LiveData<Error, ThorchainLastblock>

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
  poolDetail$: PoolDetailLD
  priceRatio$: Rx.Observable<BigNumber>
  availableAssets$: PoolAssetsLD
  validatePool$: (poolAddresses: PoolAddress, chain: Chain) => ValidatePoolLD
}

export type PoolShareType = DepositType | 'all'

export type PoolShare = {
  /**
   * Share units, which are RUNE based, provided as `BaseAmount`
   **/
  units: BaseAmount
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
  memo: string
  /**
   * Transaction id hash. Some transactions (such as outbound transactions made in the native asset) may have a zero value.
   */
  txID: string
}

export type TxType = 'DEPOSIT' | 'SWAP' | 'DOUBLE_SWAP' | 'WITHDRAW' | 'UPGRADE'

export type HistoryAction = {
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

export type HistoryActions = HistoryAction[]

export type HistoryActionsPage = {
  total: number
  actions: HistoryActions
}

export type HistoryActionsPageRD = RD.RemoteData<ApiError, HistoryActionsPage>

export type HistoryActionsPageLD = LiveData<ApiError, HistoryActionsPage>
