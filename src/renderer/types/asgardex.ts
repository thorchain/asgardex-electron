import { Address } from '@xchainjs/xchain-client'
import { BaseAmount, Asset } from '@xchainjs/xchain-util'
import { Option } from 'fp-ts/lib/Option'

import { WalletType } from '../../shared/wallet/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FixmeType = any

export type Pair = {
  source: Option<string>
  target: Option<string>
}

export type AssetWithAmount = {
  asset: Asset
  amount: BaseAmount
}

export type AssetWithAddress = {
  asset: Asset
  address: Address
}

export type AssetsWithAddress = AssetWithAddress[]

export type AssetWithWalletType = {
  asset: Asset
  walletType: WalletType
}

/**
 * Assets with 1e8 decimal,
 * mostly for data of THORChain,
 * which uses 1e8 decimal for all assets
 */
export type AssetWithAmount1e8 = {
  asset: Asset
  amount1e8: BaseAmount
}

export type AssetsWithAmount1e8 = AssetWithAmount1e8[]

export type AssetWithDecimal = {
  asset: Asset
  decimal: number
}

export type AssetsWithDecimal = AssetWithDecimal[]

export type DepositType = 'sym' | 'asym'
export type WithdrawType = 'sym' | 'asym'

export const MAX_VALUE = 100

export type TxStatus = {
  /**
   *  Modal state
   * true -> `opened` modal
   * `false` -> `closed` modal
   */
  readonly modal: boolean
  /**
   *  Current step value. It can be something between 0 - `MAX_VALUE` to show a progress of requests
   */
  readonly value: number
  /**
   *  Start time of first request - undefined by default
   */
  readonly startTime?: number
  /**
   * Status of `TxTimer` component (it could be any other component, too)
   * `true` -> `TxTimer` component is counting
   * `false` -> <TxTimer /> component is not counting
   */
  readonly status: boolean
  /**
   * Transaction hash - optional
   */
  readonly hash?: string
}

export type SlipTolerance = 0.5 | 1 | 3 | 5 | 10

export const isSlipTolerance = (value: SlipTolerance | number): value is SlipTolerance => {
  const t: SlipTolerance[] = [0.5, 1, 3, 5, 10]
  return t.includes(value as SlipTolerance)
}
