import { Balances } from '@xchainjs/xchain-binance'
import { TxsPage, Tx } from '@xchainjs/xchain-client'
import {
  getValueOfAsset1InAsset2,
  PoolData,
  BaseAmount,
  assetAmount,
  bnOrZero,
  assetFromString,
  getValueOfRuneInAsset,
  Asset,
  assetToBase,
  AssetBNB
} from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { BNB_DECIMAL, isRuneAsset } from '../../helpers/assetHelper'
import { PoolDetails } from '../midgard/types'
import { getPoolDetail, toPoolData } from '../midgard/utils'
import { AssetWithBalance, AssetsWithBalance, AssetTxsPage, AssetTx } from '../wallet/types'

/**
 * Helper to get a pool price value for a given `Balance`
 */
export const getPoolPriceValue = (
  { asset, amount }: AssetWithBalance,
  poolDetails: PoolDetails,
  selectedPricePoolData: PoolData
): O.Option<BaseAmount> => {
  return FP.pipe(
    getPoolDetail(poolDetails, asset),
    O.map(toPoolData),
    // calculate value based on `pricePoolData`
    O.map((poolData) => getValueOfAsset1InAsset2(amount, poolData, selectedPricePoolData)),
    O.alt(() => {
      // Calculate RUNE values based on `pricePoolData`
      if (isRuneAsset(asset)) {
        return O.some(getValueOfRuneInAsset(amount, selectedPricePoolData))
      }
      // In all other cases we don't have any price pool and no price
      return O.none
    })
  )
}

/**
 * Converts a BinanceChain symbol to an `Asset`
 **/
export const bncSymbolToAsset = (symbol: string): O.Option<Asset> =>
  O.fromNullable(assetFromString(bncSymbolToAssetString(symbol)))

/**
 * Converts a BinanceChain symbol to an `Asset` string
 **/
export const bncSymbolToAssetString = (symbol: string) => `${AssetBNB.chain}.${symbol}`

type GetWalletBalances = (balances: Balances) => AssetsWithBalance
export const getWalletBalances: GetWalletBalances = A.filterMap(({ symbol, free }) =>
  FP.pipe(
    bncSymbolToAsset(symbol),
    O.map((asset) => {
      const amountBN = bnOrZero(free)
      const amount = assetToBase(assetAmount(amountBN, BNB_DECIMAL))

      return { asset, amount }
    })
  )
)

export const toAssetTx = (tx: Tx): AssetTx => ({
  asset: O.some(tx.asset),
  from: tx.from,
  to: tx.to,
  date: tx.date,
  type: tx.type,
  hash: tx.hash
})

export const toTxsPage = ({ total, txs }: TxsPage): AssetTxsPage => ({
  total,
  txs: txs.map(toAssetTx)
})
