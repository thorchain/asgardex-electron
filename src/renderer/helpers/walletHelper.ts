import { Balance, Balances } from '@xchainjs/xchain-client'
import { Asset, AssetAmount, baseToAsset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { NonEmptyBalances } from '../services/wallet/types'
import { isBnbAsset, isRuneNativeAsset } from './assetHelper'
import { eqAsset } from './fp/eq'
import { sequenceTOption } from './fpHelpers'

/**
 * Tries to find an `AssetAmount` of an `Asset`
 * in a given list of `Balance`
 *
 * Note: Returns `None` if `Asset` has not been found this list.
 * */
export const getAssetAmountByAsset = (balances: Balances, assetToFind: Asset): O.Option<AssetAmount> =>
  FP.pipe(
    balances,
    A.findFirst(({ asset }) => eqAsset.equals(asset, assetToFind)),
    O.map((assetWB) => baseToAsset(assetWB.amount))
  )

export const getBalanceByAsset = (oAssetsWB: O.Option<NonEmptyBalances>, oAsset: O.Option<Asset>): O.Option<Balance> =>
  FP.pipe(
    sequenceTOption(oAssetsWB, oAsset),
    O.chain(([assetsWB, asset]) =>
      FP.pipe(
        assetsWB,
        A.findFirst(({ asset: assetInList }) => assetInList.symbol === asset.symbol)
      )
    )
  )

export const getBnbAmountFromBalances = (balances: Balances): O.Option<AssetAmount> =>
  FP.pipe(
    balances,
    A.findFirst(({ asset }) => isBnbAsset(asset)),
    O.map(({ amount }) => baseToAsset(amount))
  )

export const getRuneNativeAmountFromBalances = (balances: Balances): O.Option<AssetAmount> =>
  FP.pipe(
    balances,
    A.findFirst(({ asset }) => isRuneNativeAsset(asset)),
    O.map(({ amount }) => baseToAsset(amount))
  )
