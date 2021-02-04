import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

export type PoolShare = {
  asset: Asset
  poolShare: BigNumber
  assetDepositPrice: BaseAmount
  runeDepositPrice: BaseAmount
}
