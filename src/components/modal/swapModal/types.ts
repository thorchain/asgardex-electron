import { BaseAmount, TokenAmount } from '@thorchain/asgardex-token'
import BigNumber from 'bignumber.js'

export type CalcResult = {
  poolAddressFrom?: string
  poolAddressTo?: string
  symbolFrom?: string
  symbolTo?: string
  Px: BigNumber
  slip: BigNumber
  outputAmount: TokenAmount
  outputPrice: BigNumber
  fee: TokenAmount
  lim?: BaseAmount
}
