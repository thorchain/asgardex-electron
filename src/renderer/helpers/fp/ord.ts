import { Asset, assetToString, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as N from 'fp-ts/lib/number'
import * as Ord from 'fp-ts/lib/Ord'
import * as S from 'fp-ts/lib/string'

import { CURRENCY_WHEIGHTS } from '../../const'
import { WalletBalance } from '../../types/wallet'
import { PricePool } from '../../views/pools/Pools.types'
import { eqBaseAmount, eqBigNumber, eqAsset, eqPricePool } from './eq'

const ordString = S.Ord
const ordNumber = N.Ord

export const ordBigNumber: Ord.Ord<BigNumber> = {
  equals: eqBigNumber.equals,
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
  compare: (x, y) => ordString.compare(assetToString(x), assetToString(y))
}

/**
 * Compare WalletBalances by its Asset
 **/
export const ordWalletBalanceByAsset: Ord.Ord<WalletBalance> = {
  equals: (x, y) => eqAsset.equals(x.asset, y.asset),
  // comparing by using`assetToString`
  compare: (x, y) => ordString.compare(assetToString(x.asset), assetToString(y.asset))
}

/**
 * Comparing PricePools
 **/
export const ordPricePool: Ord.Ord<PricePool> = {
  equals: eqPricePool.equals,
  // comparing by using`assetToString`
  compare: ({ asset: assetA }, { asset: assetB }) =>
    ordNumber.compare(CURRENCY_WHEIGHTS[assetToString(assetA)] || 0, CURRENCY_WHEIGHTS[assetToString(assetB)] || 0)
}
