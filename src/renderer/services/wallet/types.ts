import * as RD from '@devexperts/remote-data-ts'
import { BaseAmount, Asset, Chain } from '@thorchain/asgardex-util'
import { getMonoid } from 'fp-ts/Array'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import { Observable } from 'rxjs'

import { LiveData } from '../../helpers/rx/liveData'

export type Phrase = string

export type KeystoreContent = { phrase: Phrase }
/**
 * Type for providing 3 states of keystore
 *
 * (1) `None` -> DEFAULT (keystore needs to be imported at start of application or after shutdown of app)
 * (2) `Some<None>` -> LOCKED STATUS (keystore file, but no phrase)
 * (3) `Some<Some<KeystoreContent>>` -> UNLOCKED + IMPORTED STATUS (keystore file + phrase)
 */
export type KeystoreState = O.Option<O.Option<KeystoreContent>>

export type KeystoreService = {
  keystore$: Observable<KeystoreState>
  addKeystore: (phrase: Phrase, password: string) => Promise<void>
  removeKeystore: () => Promise<void>
  unlock: (state: KeystoreState, password: string) => Promise<void>
  lock: () => void
}

export type AssetWithBalance = {
  asset: Asset
  amount: BaseAmount
  frozenAmount: O.Option<BaseAmount>
}

export type AssetsWithBalance = AssetWithBalance[]
export type NonEmptyAssetsWithBalance = NonEmptyArray<AssetWithBalance>

export type AssetsWithBalanceLD = LiveData<ApiError, AssetsWithBalance>
export type AssetsWithBalanceRD = RD.RemoteData<ApiError, AssetsWithBalance>
export type AssetWithBalanceRD = RD.RemoteData<ApiError, AssetWithBalance>

export type AssetsWBChain = {
  address: string
  chain: Chain
  assetsWB: AssetsWithBalanceRD
}

export type AssetsWBChains = AssetsWBChain[]

export const assetWithBalanceMonoid = getMonoid<AssetWithBalance>()

export type AssetsWithBalanceState = {
  assetsWB: O.Option<NonEmptyAssetsWithBalance>
  errors: O.Option<NonEmptyApiErrors>
  loading: boolean
}

export type AssetTxType = 'transfer' | 'freeze' | 'unfreeze' | 'unkown'
export type AssetTxTo = {
  address: string // to address
  amount: BaseAmount // amount sent to
}

export type AssetTx = {
  asset: O.Option<Asset> // asset
  from: string // from address
  to: AssetTxTo[] // to addresses
  date: Date // timestamp of tx
  type: AssetTxType // type
  hash: string // Tx hash
}

export type AssetTxs = AssetTx[]

export type AssetTxsPage = {
  total: number
  txs: AssetTxs
}

export type AssetTxsPageRD = RD.RemoteData<ApiError, AssetTxsPage>
export type AssetTxsPageLD = LiveData<ApiError, AssetTxsPage>

export type LoadAssetTxsProps = {
  limit: number
  offset: number
}

export type LoadAssetTxsHandler = (props: LoadAssetTxsProps) => void

export type LoadBalancesHandler = () => void

export enum ErrorId {
  GET_BALANCES,
  GET_ASSET_TXS,
  SEND_TX
}

export type ApiError = {
  errorId: ErrorId
  msg: string
}

export type NonEmptyApiErrors = NonEmptyArray<ApiError>

/* RD/LD for sending transactions on different chains */
export type TxRD = RD.RemoteData<ApiError, string>
export type TxLD = LiveData<ApiError, string>
