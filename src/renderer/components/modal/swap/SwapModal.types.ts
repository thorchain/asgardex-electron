import { BaseAmount, AssetAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

export type CalcResult = {
  poolAddressFrom?: string
  poolAddressTo?: string
  symbolFrom?: string
  symbolTo?: string
  Px: BigNumber
  slip: BigNumber
  outputAmount: AssetAmount
  outputPrice: BigNumber
  fee: AssetAmount
  lim?: BaseAmount
}
