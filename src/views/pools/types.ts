import { BaseAmount } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

import { PoolDetailStatusEnum } from '../../types/generated/midgard'

export type Pool = {
  asset: string
  target: string
}

// Assets
export enum PoolAsset {
  RUNE = 'BNB.RUNE-A1A',
  BNB = 'BNB.BNB',
  ETH = 'ETH.ETH',
  BTC = 'BTC.BTC',
  TUSDB = 'BNB.TUSDB-000'
}

// List of assets used for pricing
export type PoolPriceAsset = PoolAsset.RUNE | PoolAsset.ETH | PoolAsset.BTC | PoolAsset.TUSDB
export type PoolPriceAssets = PoolPriceAsset[]

export type CurrencySymbols = {
  [asset in PoolPriceAsset]: string
}

export type CurrencyWeights = {
  [asset in PoolPriceAsset]: number
}

export type PoolTableRowData = {
  pool: Pool
  depthPrice: BaseAmount
  volumePrice: BaseAmount
  transactionPrice: BaseAmount
  poolPrice: BaseAmount
  slip: BigNumber
  trades: BigNumber
  status: PoolDetailStatusEnum
  deepest?: boolean
  key: string
}

export type PoolTableRowsData = PoolTableRowData[]
