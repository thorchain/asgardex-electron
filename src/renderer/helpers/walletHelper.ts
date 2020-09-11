import { Asset, assetAmount, AssetAmount, baseToAsset } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { NonEmptyAssetsWithBalance, AssetWithBalance, AssetsWithBalance } from '../services/wallet/types'
import { isBnbAsset } from './assetHelper'
import { sequenceTOption } from './fpHelpers'

export const getAssetAmountByAsset = (balances: AssetsWithBalance, assetToFind: Asset): AssetAmount =>
  FP.pipe(
    balances,
    A.findFirst(({ asset }) => asset.symbol === assetToFind.symbol),
    O.map((b) => baseToAsset(b.amount)),
    O.getOrElse(() => assetAmount(0))
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
