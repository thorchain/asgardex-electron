import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { AssetWithDecimal } from '../../types/asgardex'

export type SwapAsset = AssetWithDecimal & { price: BigNumber }

export type SwapData = {
  readonly slip: BigNumber
  readonly swapResult: BaseAmount
}

export type AssetsToSwap = { source: Asset; target: Asset }
