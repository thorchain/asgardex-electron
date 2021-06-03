import * as RD from '@devexperts/remote-data-ts'
import { Address, TxHash } from '@xchainjs/xchain-client'
import { Client, DepositParam } from '@xchainjs/xchain-thorchain'
import { Asset, assetFromString, BaseAmount, isValidAsset } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as t from 'io-ts'
import * as D from 'io-ts/Decoder'
import * as Rx from 'rxjs'

import { Network } from '../../../shared/api/types'
import { LiveData } from '../../helpers/rx/liveData'
import * as C from '../clients'
import { ApiError, TxHashLD } from '../wallet/types'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type FeesService = C.FeesService<undefined>

export type SendTxParams = {
  recipient: string
  amount: BaseAmount
  asset: Asset
  memo?: string
}

export type AddressValidation = Client['validateAddress']

export type TransactionService = {
  sendPoolTx$: (params: DepositParam) => TxHashLD
} & C.TransactionService<SendTxParams>

export type InteractParams = {
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
  readonly txRD: RD.RemoteData<ApiError, TxHash>
}

export type InteractState$ = Rx.Observable<InteractState>

export type NodeStatus = 'active' | 'standby' | 'disabled' | 'unknown'

export type NodeInfo = {
  bond: BaseAmount
  award: BaseAmount
  status: NodeStatus
}

export type NodeInfoLD = LiveData<ApiError, NodeInfo>
export type NodeDataRD = RD.RemoteData<ApiError, NodeInfo>

export type ThorNodeApiUrlLD = LiveData<ApiError, string>

// Note: Currently we are interested in `MAXIMUMLIQUIDITYRUNE` only
export const MimirIO = t.type({
  'mimir//MAXIMUMLIQUIDITYRUNE': t.union([t.number, t.undefined])
})

export type Mimir = t.TypeOf<typeof MimirIO>

export type MimirLD = LiveData<Error, Mimir>
export type MimirRD = RD.RemoteData<Error, Mimir>

export type GetLiquidityProvidersParams = {
  asset: Asset
  network: Network
  assetDecimal: number
}

export type GetLiquidityProviderParams = GetLiquidityProvidersParams & {
  walletAddress: Address
}

export type LiquidityProvider = {
  asset: Asset
  address: Address
  pendingRune: BaseAmount
  pendingAsset: BaseAmount
  runeDepositValue: BaseAmount
  assetDepositValue: BaseAmount
}

export type LiquidityProvidersLD = LiveData<ApiError, LiquidityProvider[]>
export type LiquidityProviderLD = LiveData<ApiError, O.Option<LiquidityProvider>>
export type LiquidityProviderRD = RD.RemoteData<ApiError, O.Option<LiquidityProvider>>

const assetDecoder: D.Decoder<unknown, Asset> = FP.pipe(
  D.string,
  D.parse((stringAsset) =>
    FP.pipe(
      stringAsset,
      assetFromString,
      E.fromNullable(() => new Error('Invalid asset')),
      E.fold(() => D.failure(stringAsset, ``), D.success)
    )
  )
)

/**
 * Custom type validator to check if string is Asset instanse
 * After successful validation transforms string to Asset
 */
const assetType = new t.Type(
  'asset type',
  (input): input is Asset => {
    if (typeof input === 'string') {
      const asset = assetFromString(input)

      if (asset) {
        return isValidAsset(asset)
      }
    }
    return false
  },
  (input, context) => {
    if (typeof input === 'string') {
      return FP.pipe(
        assetFromString(input),
        E.fromNullable(Error('Invalid asset')),
        E.fold(
          () => t.failure(input, context),
          (asset) => t.success(asset)
        )
      )
    }
    return t.failure(input, context)
  },
  assetDecoder.decode
)

export const LiquidityProviderIO = t.type({
  // last_add_height: t.number,
  // units: t.string,
  asset: assetType,
  rune_address: t.string,
  pending_rune: t.string,
  pending_asset: t.string,
  rune_deposit_value: t.string,
  asset_deposit_value: t.string
})
