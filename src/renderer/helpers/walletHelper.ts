import { Asset, AssetAmount, baseToAsset } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { NonEmptyAssetsWithBalance, AssetWithBalance, AssetsWithBalance } from '../services/wallet/types'
import { isBnbAsset } from './assetHelper'
import { eqAsset } from './fp/eq'
import { sequenceTOption } from './fpHelpers'

/**
 * Tries to find an `AssetAmount` of an `Asset`
 * in a given list of `AssetWithBalance`
 *
 * Note: Returns `None` if `Asset` has not been found this list.
 * */
export const getAssetAmountByAsset = (balances: AssetsWithBalance, assetToFind: Asset): O.Option<AssetAmount> =>
  FP.pipe(
    balances,
    A.findFirst(({ asset }) => eqAsset.equals(asset, assetToFind)),
    O.map((assetWB) => baseToAsset(assetWB.amount))
  )

export const getAssetWBByAsset = (
  oAssetsWB: O.Option<NonEmptyAssetsWithBalance>,
  oAsset: O.Option<Asset>
): O.Option<AssetWithBalance> =>
  FP.pipe(
    sequenceTOption(oAssetsWB, oAsset),
    O.chain(([assetsWB, asset]) =>
      FP.pipe(
        assetsWB,
        A.findFirst(({ asset: assetInList }) => assetInList.symbol === asset.symbol)
      )
    )
  )

export const getBnbAmountFromBalances = (balances: AssetsWithBalance): O.Option<AssetAmount> =>
  FP.pipe(
    balances,
    A.findFirst(({ asset }) => isBnbAsset(asset)),
    O.map(({ amount }) => baseToAsset(amount))
  )
