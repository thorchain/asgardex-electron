import { Asset, assetToString, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as Ord from 'fp-ts/lib/Ord'

import { WalletBalance } from '../../types/wallet'
import { eqBaseAmount, egBigNumber, eqAsset } from './eq'

export const ordBigNumber: Ord.Ord<BigNumber> = {
  equals: egBigNumber.equals,
  compare: (x, y) => (x.isLessThan(y) ? -1 : x.isGreaterThan(y) ? 1 : 0)
}

export const ordBaseAmount: Ord.Ord<BaseAmount> = {
  equals: eqBaseAmount.equals,
  compare: (x, y) => ordBigNumber.compare(x.amount(), y.amount())
}

/**
 * Comparing Assets
 **/
export const ordAsset: Ord.Ord<Asset> = {
  equals: eqAsset.equals,
  // comparing by using`assetToString`
  compare: (x, y) => Ord.ordString.compare(assetToString(x), assetToString(y))
}

/**
 * Comparing Assets
 **/
export const ordBalance: Ord.Ord<WalletBalance> = {
  equals: (x, y) => eqAsset.equals(x.asset, y.asset),
  // comparing by using`assetToString`
  compare: (x, y) => Ord.ordString.compare(assetToString(x.asset), assetToString(y.asset))
}
