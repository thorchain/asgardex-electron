import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

export type PoolShareTableRowData = {
  asset: Asset
  runeShare: BaseAmount
  assetShare: BaseAmount
  sharePercent: BigNumber
  assetDepositPrice: BaseAmount
  runeDepositPrice: BaseAmount
}

export type PoolShareTableData = PoolShareTableRowData[]
