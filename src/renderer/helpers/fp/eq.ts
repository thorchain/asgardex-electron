import * as RD from '@devexperts/remote-data-ts'
import { Asset, BaseAmount, assetToString } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as Eq from 'fp-ts/lib/Eq'
import * as O from 'fp-ts/lib/Option'

import { AssetWithBalance, ApiError, AssetsWithBalance } from '../../services/wallet/types'

export const eqOString = O.getEq(Eq.eqString)

export const eqAsset: Eq.Eq<Asset> = {
  equals: (x, y) => assetToString(x) === assetToString(y)
}

export const eqBaseAmount: Eq.Eq<BaseAmount> = {
  equals: (x, y) => x.amount().isEqualTo(y.amount()) && x.decimal === y.decimal
}

const eqOptionBaseAmount = O.getEq(eqBaseAmount)

export const eqAssetWithBalance: Eq.Eq<AssetWithBalance> = {
  equals: (x, y) =>
    eqAsset.equals(x.asset, y.asset) &&
    eqBaseAmount.equals(x.amount, y.amount) &&
    eqOptionBaseAmount.equals(x.frozenAmount, y.frozenAmount)
}

export const eqErrorId = Eq.eqNumber
export const eqApiId = Eq.eqString

export const eqApiError = Eq.getStructEq<ApiError>({
  apiId: eqApiId,
  errorId: eqErrorId,
  msg: Eq.eqString
})

export const eqAssetsWithBalance = A.getEq(eqAssetWithBalance)

export const eqAssetWithBalanceRD = RD.getEq<ApiError, AssetWithBalance>(eqApiError, eqAssetWithBalance)
export const eqAssetsWithBalanceRD = RD.getEq<ApiError, AssetsWithBalance>(eqApiError, eqAssetsWithBalance)
