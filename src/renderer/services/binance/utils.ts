import { Balance, Balances, TxPage, TxType } from '@xchainjs/xchain-binance'
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
  bn,
  isValidBN,
  AssetBNB
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { BNB_DECIMAL, isRuneAsset } from '../../helpers/assetHelper'
import { PoolDetails } from '../midgard/types'
import { getPoolDetail, toPoolData } from '../midgard/utils'
import { AssetWithBalance, AssetsWithBalance, AssetTxsPage, AssetTx, AssetTxType } from '../wallet/types'
import { TxsPage, Tx} from '@xchainjs/xchain-client'

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

export const getWalletBalances = (balances: Balances): AssetsWithBalance =>
  balances.reduce((acc: AssetsWithBalance, { symbol, free, frozen }: Balance) => {
    const oAsset = bncSymbolToAsset(symbol)
    // ignore balances w/o symbols
    return FP.pipe(
      oAsset,
      O.map((asset) => {
        const amountBN = bnOrZero(free)
        const amount = assetToBase(assetAmount(amountBN, BNB_DECIMAL))
        const frozenAmountBN = bn(frozen)
        const frozenAmount = isValidBN(frozenAmountBN) ? O.some(assetToBase(assetAmount(frozenAmountBN))) : O.none

        return [...acc, { asset, amount, frozenAmount }]
      }),
      O.getOrElse(() => acc)
    )
  }, [])

// export const toAssetTxType = (txType: TxType): AssetTxType => {
//   switch (txType) {
//     case 'FREEZE_TOKEN':
//       return 'freeze'
//     case 'UN_FREEZE_TOKEN':
//       return 'unfreeze'
//     case 'TRANSFER':
//       return 'transfer'
//     default:
//       return 'unknown'
//   }
// }

export const toAssetTx = (tx: Tx): AssetTx => {
  // const amount = assetToBase(assetAmount(bnOrZero(tx.value)))
  return {
    asset:  O.some(tx.asset),
    from: tx.from,
    to: tx.to,
    date: tx.date,
    // type: toAssetTxType(tx.txType),
    type: tx.type,
    hash: tx.hash
  }
}

export const toTxsPage = ({ total, txs }: TxsPage): AssetTxsPage => ({
  total,
  txs: txs.map(toAssetTx)
})
