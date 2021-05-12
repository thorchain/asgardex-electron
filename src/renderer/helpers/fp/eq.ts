import * as RD from '@devexperts/remote-data-ts'
import { Balance, Balances } from '@xchainjs/xchain-client'
import { Asset, AssetAmount, BaseAmount, Chain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as Eq from 'fp-ts/lib/Eq'
import * as N from 'fp-ts/lib/number'
import * as O from 'fp-ts/lib/Option'
import * as S from 'fp-ts/lib/string'

import { DepositAssetFees, DepositFees, SwapFeesParams } from '../../services/chain/types'
import { ApproveParams } from '../../services/ethereum/types'
import { PoolAddress, PoolShare } from '../../services/midgard/types'
import { ApiError } from '../../services/wallet/types'
import { AssetWithAmount } from '../../types/asgardex'
import { WalletBalance } from '../../types/wallet'

const eqString = S.Eq

export const eqOString = O.getEq(eqString)

export const eqONumber = O.getEq(N.Eq)

export const eqBigNumber: Eq.Eq<BigNumber> = {
  equals: (x, y) => x.isEqualTo(y)
}

export const eqOBigNumber: Eq.Eq<O.Option<BigNumber>> = O.getEq(eqBigNumber)

export const eqAsset: Eq.Eq<Asset> = {
  equals: (x, y) => eqString.equals(x.chain, y.chain) && eqString.equals(x.symbol.toUpperCase(), y.symbol.toUpperCase())
}

export const eqOAsset = O.getEq(eqAsset)

export const eqChain: Eq.Eq<Chain> = {
  equals: (x, y) => eqString.equals(x, y)
}

export const eqOChain = O.getEq(eqChain)

export const eqBaseAmount: Eq.Eq<BaseAmount> = {
  equals: (x, y) => eqBigNumber.equals(x.amount(), y.amount()) && x.decimal === y.decimal
}

export const eqAssetAmount: Eq.Eq<AssetAmount> = {
  equals: (x, y) => eqBigNumber.equals(x.amount(), y.amount()) && x.decimal === y.decimal
}

export const eqOptionBaseAmount = O.getEq(eqBaseAmount)

export const eqBalance: Eq.Eq<Balance> = {
  equals: (x, y) => eqAsset.equals(x.asset, y.asset) && eqBaseAmount.equals(x.amount, y.amount)
}

export const eqAssetWithAmount: Eq.Eq<AssetWithAmount> = {
  equals: (x, y) => eqAsset.equals(x.asset, y.asset) && eqBaseAmount.equals(x.amount, y.amount)
}

export const eqOAssetWithAmount = O.getEq(eqAssetWithAmount)

export const eqONullableString: Eq.Eq<O.Option<string> | undefined> = {
  equals: (x, y) => {
    if (x && y) {
      return eqOString.equals(x, y)
    }
    return x === y
  }
}

export const eqNullableBaseAmount: Eq.Eq<BaseAmount | undefined> = {
  equals: (x, y) => {
    if (x && y) {
      return eqBaseAmount.equals(x, y)
    }
    return x === y
  }
}

export const eqErrorId = eqString

export const eqApiError = Eq.struct<ApiError>({
  errorId: eqErrorId,
  msg: eqString
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

export const eqPoolShare = Eq.struct<PoolShare>({
  asset: eqAsset,
  assetAddedAmount: eqBaseAmount,
  units: eqBigNumber,
  type: eqString
})

export const eqPoolShares = A.getEq(eqPoolShare)

export const eqPoolAddresses = Eq.struct<PoolAddress>({
  chain: eqChain,
  address: eqString,
  router: eqOString
})

export const eqOPoolAddresses = O.getEq(eqPoolAddresses)

export const eqSwapFeesParams = Eq.struct<SwapFeesParams>({
  inAsset: eqAsset,
  outAsset: eqAsset
})

export const eqDepositApproveParams = Eq.struct<ApproveParams>({
  spender: eqString,
  sender: eqString,
  amount: eqNullableBaseAmount
})

export const eqODepositApproveParams = O.getEq(eqDepositApproveParams)

export const eqOSwapFeesParams = O.getEq(eqSwapFeesParams)

export const eqDepositFees = Eq.struct<DepositFees>({
  inFee: eqBaseAmount,
  outFee: eqBaseAmount,
  refundFee: eqBaseAmount
})

export const eqODepositFees = O.getEq(eqDepositFees)

export const eqDepositAssetFees = Eq.struct<DepositAssetFees>({
  inFee: eqBaseAmount,
  outFee: eqBaseAmount,
  refundFee: eqBaseAmount,
  asset: eqAsset
})

export const eqODepositAssetFees = O.getEq(eqDepositAssetFees)
