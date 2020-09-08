import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetAmount, AssetAmount, baseToAsset } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { AssetsWithBalance, AssetsWithBalanceRD, AssetWithBalance } from '../services/wallet/types'
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
  balancesRD: AssetsWithBalanceRD,
  oAsset: O.Option<Asset>
): O.Option<AssetWithBalance> =>
  FP.pipe(
    sequenceTOption(FP.pipe(balancesRD, RD.toOption), oAsset),
    O.chain(([balances, asset]) =>
      FP.pipe(
        balances,
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
