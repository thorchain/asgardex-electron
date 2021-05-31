import { Balances as BinanceBalances } from '@xchainjs/xchain-binance'
import { Balances } from '@xchainjs/xchain-client'
import { assetAmount, bnOrZero, assetFromString, Asset, assetToBase, AssetBNB } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { BNB_DECIMAL } from '../../helpers/assetHelper'

/**
 * Converts a BinanceChain symbol to an `Asset`
 **/
export const bncSymbolToAsset = (symbol: string): O.Option<Asset> =>
  O.fromNullable(assetFromString(bncSymbolToAssetString(symbol)))

/**
 * Converts a BinanceChain symbol to an `Asset` string
 **/
export const bncSymbolToAssetString = (symbol: string) => `${AssetBNB.chain}.${symbol}`

type GetWalletBalances = (balances: BinanceBalances) => Balances
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
