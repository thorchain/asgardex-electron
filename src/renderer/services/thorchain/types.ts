import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Client, DepositParam } from '@xchainjs/xchain-thorchain'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'
import * as t from 'io-ts'
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable'
import * as Rx from 'rxjs'

import { assetIO } from '../../../shared/api/io'
import { Network } from '../../../shared/api/types'
import { WalletType } from '../../../shared/wallet/types'
import { LiveData } from '../../helpers/rx/liveData'
import { AssetsWithAmount1e8, AssetWithAmount1e8 } from '../../types/asgardex'
import * as C from '../clients'
import { ApiError, TxHashLD, TxHashRD } from '../wallet/types'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type FeesService = C.FeesService

export type SendTxParams = {
  walletType: WalletType
  sender?: string
  recipient: string
  amount: BaseAmount
  asset: Asset
  memo?: string
  walletIndex: number
}

export type TransactionService = {
  sendPoolTx$: (
    params: DepositParam & {
      walletType: WalletType
      walletIndex: number /* override walletIndex of DepositParam to avoid 'undefined' */
    }
  ) => TxHashLD
} & C.TransactionService<SendTxParams>

export type InteractParams = {
  readonly walletType: WalletType
  readonly walletIndex: number
  readonly amount: BaseAmount
  readonly memo: string
}

/**
 * State to reflect status of a interact actions by doing different requests
 */
export type InteractState = {
  // Number of current step
  readonly step: number
  // Constant total amount of steps
  readonly stepsTotal: 2
  // RD of all requests
  readonly txRD: TxHashRD
}

export type InteractState$ = Rx.Observable<InteractState>

export type InteractStateHandler = (p: InteractParams) => InteractState$

export type NodeStatus = 'active' | 'standby' | 'disabled' | 'unknown'

export type NodeInfo = {
  bond: BaseAmount
  award: BaseAmount
  status: NodeStatus
}

export type NodeInfoLD = LiveData<ApiError, NodeInfo>
export type NodeDataRD = RD.RemoteData<ApiError, NodeInfo>

export type ThorNodeApiUrlLD = LiveData<ApiError, string>

/**
 * IO type for mimir endpoints:
 * mainnet: https://thornode.thorchain.info/thorchain/mimir
 * testnet: https://testnet.thornode.thorchain.info/thorchain/mimir
 */
export const MimirIO = t.type({
  MAXIMUMLIQUIDITYRUNE: t.union([t.number, t.undefined]),
  POOLCYCLE: t.union([t.number, t.undefined]),
  HALTTRADING: t.union([t.number, t.undefined]),
  HALTTHORCHAIN: t.union([t.number, t.undefined]),
  HALTETHCHAIN: t.union([t.number, t.undefined]),
  HALTETHTRADING: t.union([t.number, t.undefined]),
  HALTBTCCHAIN: t.union([t.number, t.undefined]),
  HALTBTCTRADING: t.union([t.number, t.undefined]),
  HALTBCHCHAIN: t.union([t.number, t.undefined]),
  HALTBCHTRADING: t.union([t.number, t.undefined]),
  HALTLTCCHAIN: t.union([t.number, t.undefined]),
  HALTLTCTRADING: t.union([t.number, t.undefined]),
  HALTBNBCHAIN: t.union([t.number, t.undefined]),
  HALTBNBTRADING: t.union([t.number, t.undefined]),
  HALTDOGECHAIN: t.union([t.number, t.undefined]),
  HALTDOGETRADING: t.union([t.number, t.undefined]),
  HALTTERRACHAIN: t.union([t.number, t.undefined]),
  HALTTERRATRADING: t.union([t.number, t.undefined]),
  PAUSELP: t.union([t.number, t.undefined]),
  PAUSELPBNB: t.union([t.number, t.undefined]),
  PAUSELPBCH: t.union([t.number, t.undefined]),
  PAUSELPBTC: t.union([t.number, t.undefined]),
  PAUSELPETH: t.union([t.number, t.undefined]),
  PAUSELPLTC: t.union([t.number, t.undefined]),
  PAUSELPDOGE: t.union([t.number, t.undefined]),
  PAUSELPTERRA: t.union([t.number, t.undefined])
})

export type Mimir = t.TypeOf<typeof MimirIO>

export type MimirLD = LiveData<Error, Mimir>
export type MimirRD = RD.RemoteData<Error, Mimir>

export type MimirHaltChain = {
  haltThorChain: boolean
  haltBtcChain: boolean
  haltEthChain: boolean
  haltBchChain: boolean
  haltLtcChain: boolean
  haltBnbChain: boolean
  haltDogeChain: boolean
  haltTerraChain: boolean
}
export type MimirHaltTrading = {
  haltTrading: boolean
  haltBtcTrading: boolean
  haltEthTrading: boolean
  haltBchTrading: boolean
  haltLtcTrading: boolean
  haltBnbTrading: boolean
  haltDogeTrading: boolean
  haltTerraTrading: boolean
}

export type MimirPauseLP = {
  pauseLp: boolean
  pauseLpBnb: boolean
  pauseLpBch: boolean
  pauseLpBtc: boolean
  pauseLpEth: boolean
  pauseLpLtc: boolean
  pauseLpDoge: boolean
  pauseLpTerra: boolean
}

export type MimirHalt = MimirHaltChain & MimirHaltTrading & MimirPauseLP

export type MimirHaltRD = RD.RemoteData<Error, MimirHalt>

export type GetLiquidityProvidersParams = {
  asset: Asset
  network: Network
}

export type GetLiquidityProviderParams = GetLiquidityProvidersParams & {
  runeAddress: Address
  assetAddress: Address
}

export type PendingAsset = AssetWithAmount1e8
export type PendingAssets = AssetsWithAmount1e8
export type PendingAssetsRD = RD.RemoteData<ApiError, PendingAssets>

export type LiquidityProvider = {
  runeAddress: O.Option<Address>
  assetAddress: O.Option<Address>

  pendingRune: O.Option<PendingAsset>
  pendingAsset: O.Option<PendingAsset>
}

export type LiquidityProvidersLD = LiveData<ApiError, LiquidityProvider[]>
export type LiquidityProviderLD = LiveData<ApiError, O.Option<LiquidityProvider>>
export type LiquidityProviderRD = RD.RemoteData<ApiError, O.Option<LiquidityProvider>>
export type LiquidityProvidersRD = RD.RemoteData<ApiError, LiquidityProvider[]>

export type LiquidityProviderHasAsymAssets = { rune: boolean; asset: boolean }
export type LiquidityProviderHasAsymAssetsRD = RD.RemoteData<ApiError, LiquidityProviderHasAsymAssets>

export type LiquidityProviderAssetMismatch = O.Option<{ runeAddress: Address; assetAddress: Address }>
export type LiquidityProviderAssetMismatchRD = RD.RemoteData<ApiError, LiquidityProviderAssetMismatch>

export const LiquidityProviderIO = t.type({
  asset: assetIO,
  rune_address: optionFromNullable(t.string),
  asset_address: optionFromNullable(t.string),
  pending_rune: t.string,
  pending_asset: t.string
})

export const erc20WhitelistTokenIO = t.type({
  chainId: t.number,
  address: t.string,
  symbol: t.string,
  name: t.string,
  logoURI: t.union([t.string, t.undefined])
})

export type ERC20WhitelistToken = t.TypeOf<typeof erc20WhitelistTokenIO>

export const erc20WhitelistIO = t.type({
  tokens: t.array(erc20WhitelistTokenIO),
  version: t.type({
    major: t.number,
    minor: t.number,
    patch: t.number
  })
})

export type ERC20Whitelist = t.TypeOf<typeof erc20WhitelistIO>
