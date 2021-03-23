import * as RD from '@devexperts/remote-data-ts'
import { Balance, Balances } from '@xchainjs/xchain-client'
import { Asset, BaseAmount, Chain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as Eq from 'fp-ts/lib/Eq'
import * as O from 'fp-ts/lib/Option'

import { PoolAddress, PoolShare } from '../../services/midgard/types'
import { ApiError } from '../../services/wallet/types'
import { AssetWithAmount } from '../../types/asgardex'
import { WalletBalance } from '../../types/wallet'

export const eqOString = O.getEq(Eq.eqString)

export const eqBigNumber: Eq.Eq<BigNumber> = {
  equals: (x, y) => x.isEqualTo(y)
}

export const eqAsset: Eq.Eq<Asset> = {
  equals: (x, y) =>
    Eq.eqString.equals(x.chain, y.chain) && Eq.eqString.equals(x.symbol.toUpperCase(), y.symbol.toUpperCase())
}

export const eqOAsset = O.getEq(eqAsset)

export const eqChain: Eq.Eq<Chain> = {
  equals: (x, y) => Eq.eqString.equals(x, y)
}

export const eqOChain = O.getEq(eqChain)

export const eqBaseAmount: Eq.Eq<BaseAmount> = {
  equals: (x, y) => eqBigNumber.equals(x.amount(), y.amount()) && x.decimal === y.decimal
}

export const eqOptionBaseAmount = O.getEq(eqBaseAmount)

export const eqBalance: Eq.Eq<Balance> = {
  equals: (x, y) => eqAsset.equals(x.asset, y.asset) && eqBaseAmount.equals(x.amount, y.amount)
}

export const eqAssetWithAmount: Eq.Eq<AssetWithAmount> = {
  equals: (x, y) => eqAsset.equals(x.asset, y.asset) && eqBaseAmount.equals(x.amount, y.amount)
}

export const eqONullableString: Eq.Eq<O.Option<string> | undefined> = {
  equals: (x, y) => {
    if (x && y) {
      return eqOString.equals(x, y)
    }
    return x === y
  }
}

export const eqErrorId = Eq.eqString

export const eqApiError = Eq.getStructEq<ApiError>({
  errorId: eqErrorId,
  msg: Eq.eqString
})

export const eqBalances = A.getEq(eqBalance)
export const eqAssetsWithAmount = A.getEq(eqAssetWithAmount)

export const eqBalanceRD = RD.getEq<ApiError, Balance>(eqApiError, eqBalance)
export const eqBalancesRD = RD.getEq<ApiError, Balances>(eqApiError, eqBalances)

export const eqAssetsWithBalanceRD = RD.getEq<ApiError, Balances>(eqApiError, eqBalances)

export const eqWalletBalance: Eq.Eq<WalletBalance> = {
  equals: (x, y) => eqBalance.equals(x, y) && x.walletAddress === y.walletAddress
}
export const eqOWalletBalance = O.getEq(eqWalletBalance)
export const eqWalletBalances = A.getEq(eqWalletBalance)

export const eqPoolShare = Eq.getStructEq<PoolShare>({
  asset: eqAsset,
  assetAddedAmount: eqBaseAmount,
  units: eqBigNumber,
  type: Eq.eqString
})

export const eqPoolShares = A.getEq(eqPoolShare)

export const eqPoolAddresses = Eq.getStructEq<PoolAddress>({
  chain: eqChain,
  address: Eq.eqString,
  router: eqOString
})

export const eqOPoolAddresses = O.getEq(eqPoolAddresses)
