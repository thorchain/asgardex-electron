import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

export type SwapData = {
  readonly slip: BigNumber
  readonly swapResult: BaseAmount
}

export type AssetsToSwap = { source: Asset; target: Asset }
