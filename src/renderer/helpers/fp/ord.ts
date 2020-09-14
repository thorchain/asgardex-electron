import { BaseAmount } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as Ord from 'fp-ts/lib/Ord'

import { eqBaseAmount, egBigNumber } from './eq'

export const ordBigNumber: Ord.Ord<BigNumber> = {
  equals: egBigNumber.equals,
  compare: (x, y) => (x.isLessThan(y) ? -1 : x.isGreaterThan(y) ? 1 : 0)
}

export const ordBaseAmount: Ord.Ord<BaseAmount> = {
  equals: eqBaseAmount.equals,
  compare: (x, y) => ordBigNumber.compare(x.amount(), y.amount())
}
