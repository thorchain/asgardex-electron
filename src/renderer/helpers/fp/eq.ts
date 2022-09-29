import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import { Balance } from '@xchainjs/xchain-client'
import { Address, Asset, AssetAmount, assetToString, BaseAmount, Chain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as B from 'fp-ts/lib/boolean'
import * as Eq from 'fp-ts/lib/Eq'
import * as N from 'fp-ts/lib/number'
import * as O from 'fp-ts/lib/Option'
import * as S from 'fp-ts/lib/string'

import { ApiUrls, KeystoreId, LedgerError, Network } from '../../../shared/api/types'
import { HDMode, WalletAddress, WalletType } from '../../../shared/wallet/types'
import { DepositAssetFees, DepositFees, SwapFeesParams, SymDepositAddresses } from '../../services/chain/types'
import { ApproveParams } from '../../services/ethereum/types'
import { PoolAddress, PoolShare } from '../../services/midgard/types'
import { ApiError, LedgerAddress, SelectedWalletAsset, WalletBalance } from '../../services/wallet/types'
import { AssetWithAmount } from '../../types/asgardex'
import { PricePool } from '../../views/pools/Pools.types'

export const eqString = S.Eq

export const eqNumber = N.Eq

const eqBoolean = B.Eq

export const eqOString = O.getEq(eqString)

export const eqONumber = O.getEq(eqNumber)

export const eqBigNumber: Eq.Eq<BigNumber> = {
  equals: (x, y) => x.isEqualTo(y)
}

export const eqOBigNumber: Eq.Eq<O.Option<BigNumber>> = O.getEq(eqBigNumber)

export const eqAddress: Eq.Eq<Address> = eqString
export const eqOAddress: Eq.Eq<O.Option<Address>> = eqOString

export const eqAsset: Eq.Eq<Asset> = {
  equals: (x, y) => eqString.equals(assetToString(x).toUpperCase(), assetToString(y).toUpperCase())
}

export const eqOAsset = O.getEq(eqAsset)

export const eqChain: Eq.Eq<Chain> = {
  equals: (x, y) => eqString.equals(x, y)
}

export const eqOChain = O.getEq(eqChain)

export const eqNetwork: Eq.Eq<Network> = eqString

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
export const eqBalancesRD = RD.getEq<ApiError, Balance[]>(eqApiError, eqBalances)

export const eqAssetsWithBalanceRD = RD.getEq<ApiError, Balance[]>(eqApiError, eqBalances)

export const eqWalletType: Eq.Eq<WalletType> = eqString

export const eqHDMode: Eq.Eq<HDMode> = eqString
export const eqOHDMode = O.getEq(eqHDMode)

export const eqWalletBalance: Eq.Eq<WalletBalance> = {
  equals: (x, y) => eqBalance.equals(x, y) && x.walletAddress === y.walletAddress
}
export const eqOWalletBalance = O.getEq(eqWalletBalance)
export const eqWalletBalances = A.getEq(eqWalletBalance)

export const eqSelectedWalletAsset = Eq.struct<SelectedWalletAsset>({
  asset: eqAsset,
  walletAddress: eqAddress,
  walletIndex: eqNumber,
  walletType: eqWalletType,
  hdMode: eqHDMode
})

export const eqOSelectedWalletAsset = O.getEq(eqSelectedWalletAsset)

export const eqPoolShare = Eq.struct<PoolShare>({
  asset: eqAsset,
  assetAddedAmount: eqBaseAmount,
  units: eqBigNumber,
  type: eqString,
  assetAddress: eqOAddress,
  runeAddress: eqOAddress
})

export const eqPoolShares = A.getEq(eqPoolShare)

export const eqPoolAddresses = Eq.struct<PoolAddress>({
  chain: eqChain,
  address: eqAddress,
  router: eqOAddress,
  halted: eqBoolean
})

export const eqOPoolAddresses = O.getEq(eqPoolAddresses)

export const eqSwapFeesParams = Eq.struct<SwapFeesParams>({
  inAsset: eqAsset,
  outAsset: eqAsset
})

export const eqApproveParams = Eq.struct<ApproveParams>({
  network: eqString,
  spenderAddress: eqAddress,
  contractAddress: eqAddress,
  fromAddress: eqAddress,
  walletIndex: eqNumber,
  walletType: eqWalletType,
  hdMode: eqHDMode
})

export const eqOApproveParams = O.getEq(eqApproveParams)

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

export const eqHaltedChain = Eq.struct({
  chain: eqChain,
  halted: eqBoolean
})

export const eqPoolData = Eq.struct<PoolData>({
  assetBalance: eqBaseAmount,
  runeBalance: eqBaseAmount
})

export const eqPricePool = Eq.struct<PricePool>({
  asset: eqAsset,
  poolData: eqPoolData
})

export const eqLedgerErrorId = eqString
const eqLedgerError = Eq.struct<LedgerError>({
  errorId: eqLedgerErrorId,
  msg: eqString
})

export const eqKeystoreId: Eq.Eq<KeystoreId> = eqNumber

export const eqWalletAddress = Eq.struct<WalletAddress>({
  address: eqAddress,
  type: eqString,
  chain: eqChain,
  walletIndex: eqNumber,
  hdMode: eqHDMode
})

export const eqOWalletAddress = O.getEq(eqWalletAddress)

export const eqLedgerAddressRD = RD.getEq<LedgerError, WalletAddress>(eqLedgerError, eqWalletAddress)

export const eqLedgerAddress = Eq.struct<LedgerAddress>({
  keystoreId: eqKeystoreId,
  chain: eqChain,
  network: eqNetwork,
  address: eqAddress,
  walletIndex: eqNumber,
  hdMode: eqHDMode,
  type: eqWalletType
})

export const eqOLedgerAddress = O.getEq(eqLedgerAddress)

export const eqSymDepositAddresses = Eq.struct<SymDepositAddresses>({
  rune: eqOWalletAddress,
  asset: eqOWalletAddress
})

export const eqApiUrls = Eq.struct<ApiUrls>({
  mainnet: eqString,
  stagenet: eqString,
  testnet: eqString
})
