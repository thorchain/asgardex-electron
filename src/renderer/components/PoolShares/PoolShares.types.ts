import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { PoolShareType } from '../../services/midgard/types'

export type PoolShareTableRowData = {
  asset: Asset
  runeShare: BaseAmount
  assetShare: BaseAmount
  sharePercent: BigNumber
  assetDepositPrice: BaseAmount
  runeDepositPrice: BaseAmount
  type: PoolShareType
}

export type PoolShareTableData = PoolShareTableRowData[]
