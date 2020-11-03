import * as RD from '@devexperts/remote-data-ts'
import { Asset, BaseAmount, assetToString, Chain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as Eq from 'fp-ts/lib/Eq'
import * as O from 'fp-ts/lib/Option'

import { AssetWithBalance, ApiError, AssetsWithBalance } from '../../services/wallet/types'

export const eqOString = O.getEq(Eq.eqString)

export const egBigNumber: Eq.Eq<BigNumber> = {
  equals: (x, y) => x.isEqualTo(y)
}

export const eqAsset: Eq.Eq<Asset> = {
  equals: (x, y) => assetToString(x) === assetToString(y)
}

export const eqOAsset = O.getEq(eqAsset)

export const eqChain: Eq.Eq<Chain> = {
  equals: (x, y) => Eq.eqString.equals(x, y)
}

export const eqOChain = O.getEq(eqChain)

export const eqBaseAmount: Eq.Eq<BaseAmount> = {
  equals: (x, y) => egBigNumber.equals(x.amount(), y.amount()) && x.decimal === y.decimal
}

const eqOptionBaseAmount = O.getEq(eqBaseAmount)

export const eqAssetWithBalance: Eq.Eq<AssetWithBalance> = {
  equals: (x, y) =>
    eqAsset.equals(x.asset, y.asset) &&
    eqBaseAmount.equals(x.amount, y.amount) &&
    eqOptionBaseAmount.equals(x.frozenAmount, y.frozenAmount)
}

export const eqErrorId = Eq.eqNumber

export const eqApiError = Eq.getStructEq<ApiError>({
  errorId: eqErrorId,
  msg: Eq.eqString
})

export const eqAssetsWithBalance = A.getEq(eqAssetWithBalance)

export const eqAssetWithBalanceRD = RD.getEq<ApiError, AssetWithBalance>(eqApiError, eqAssetWithBalance)
export const eqAssetsWithBalanceRD = RD.getEq<ApiError, AssetsWithBalance>(eqApiError, eqAssetsWithBalance)
