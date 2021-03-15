import * as RD from '@devexperts/remote-data-ts'
import { Balance, Balances } from '@xchainjs/xchain-client'
import { Asset, BaseAmount, Chain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as Eq from 'fp-ts/lib/Eq'
import * as O from 'fp-ts/lib/Option'

import { DepositFeesParams } from '../../services/chain/types'
import { PoolShare } from '../../services/midgard/types'
import { ApiError } from '../../services/wallet/types'
import { WalletBalance } from '../../types/wallet'
import { isEthChain } from '../chainHelper'

export const eqOString = O.getEq(Eq.eqString)

export const egBigNumber: Eq.Eq<BigNumber> = {
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
  equals: (x, y) => egBigNumber.equals(x.amount(), y.amount()) && x.decimal === y.decimal
}

export const eqOptionBaseAmount = O.getEq(eqBaseAmount)

export const eqBalance: Eq.Eq<Balance> = {
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

export const eqDepositFeesParams: Eq.Eq<DepositFeesParams> = {
  equals: (x, y) => {
    // Check if entered chain was changed
    // Check if entered amount was changed
    // Check if router was changed
    // For ETH chain, need to check if asset was changed (ETH assets have different fees)
    return (
      eqChain.equals(x.asset.chain, y.asset.chain) &&
      (!isEthChain(x.asset.chain) || eqAsset.equals(x.asset, y.asset)) &&
      eqBaseAmount.equals(x.amount, y.amount) &&
      eqONullableString.equals(x.router, y.router)
    )
  }
}

export const eqErrorId = Eq.eqString

export const eqApiError = Eq.getStructEq<ApiError>({
  errorId: eqErrorId,
  msg: Eq.eqString
})

export const eqBalances = A.getEq(eqBalance)

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
  units: eqBaseAmount,
  type: Eq.eqString
})
export const eqPoolShares = A.getEq(eqPoolShare)
