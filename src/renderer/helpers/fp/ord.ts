import { Asset, assetToString, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as N from 'fp-ts/lib/number'
import * as Ord from 'fp-ts/lib/Ord'
import * as S from 'fp-ts/lib/string'

import { Chain } from '../../../shared/utils/chain'
import { WalletAddress } from '../../../shared/wallet/types'
import { CURRENCY_WEIGHTS, CHAIN_WEIGHTS } from '../../const'
import { WalletBalance } from '../../services/wallet/types'
import { PricePool } from '../../views/pools/Pools.types'
import { eqBaseAmount, eqBigNumber, eqAsset, eqPricePool, eqChain } from './eq'

export const ordString = S.Ord
export const ordNumber = N.Ord

export const ordBigNumber: Ord.Ord<BigNumber> = {
  equals: eqBigNumber.equals,
  compare: (x, y) => (x.isLessThan(y) ? -1 : x.isGreaterThan(y) ? 1 : 0)
}

export const ordBaseAmount: Ord.Ord<BaseAmount> = {
  equals: eqBaseAmount.equals,
  compare: (x, y) => ordBigNumber.compare(x.amount(), y.amount())
}

/**
 * `Ord` instance for Chain
 **/
export const ordChain: Ord.Ord<Chain> = {
  equals: eqChain.equals,
  compare: (x, y) => ordString.compare(x, y)
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
  compare: (x, y) => ordAsset.compare(x.asset, y.asset)
}

/**
 * Compare WalletAddress by its Chain
 */
export const ordWalletAddressByChain: Ord.Ord<WalletAddress> = {
  equals: (x, y) => eqChain.equals(x.chain, y.chain),
  // comparing chains by its weights
  compare: (x, y) => ordNumber.compare(CHAIN_WEIGHTS[x.chain] || 0, CHAIN_WEIGHTS[y.chain] || 0)
}

/**
 * Comparing PricePools
 **/
export const ordPricePool: Ord.Ord<PricePool> = {
  equals: eqPricePool.equals,
  // comparing by using`assetToString`
  compare: ({ asset: assetA }, { asset: assetB }) =>
    ordNumber.compare(CURRENCY_WEIGHTS[assetToString(assetA)] || 0, CURRENCY_WEIGHTS[assetToString(assetB)] || 0)
}
