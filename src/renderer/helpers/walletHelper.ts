import { Address } from '@xchainjs/xchain-client'
import { Asset, AssetAmount, baseToAsset, Chain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/Option'

import { isLedgerWallet } from '../../shared/utils/guard'
import { WalletAddress, WalletType } from '../../shared/wallet/types'
import { ZERO_ASSET_AMOUNT } from '../const'
import { WalletBalances } from '../services/clients'
import { NonEmptyWalletBalances, WalletBalance } from '../services/wallet/types'
import { isBnbAsset, isEthAsset, isLtcAsset, isRuneNativeAsset } from './assetHelper'
import { eqAddress, eqAsset, eqChain, eqWalletType } from './fp/eq'

/**
 * Tries to find an `AssetAmount` of an `Asset`
 * in a given list of `Balance`
 *
 * Note: Returns `None` if `Asset` has not been found this list.
 * */
export const getAssetAmountByAsset = (balances: WalletBalances, assetToFind: Asset): O.Option<AssetAmount> =>
  FP.pipe(
    balances,
    A.findFirst(({ asset }) => eqAsset.equals(asset, assetToFind)),
    O.map((walletBalance) => baseToAsset(walletBalance.amount))
  )

export const getWalletBalanceByAsset = (
  oWalletBalances: O.Option<NonEmptyWalletBalances>,
  asset: Asset
): O.Option<WalletBalance> =>
  FP.pipe(
    oWalletBalances,
    O.chain((walletBalances) =>
      FP.pipe(
        walletBalances,
        A.findFirst(({ asset: assetInList }) => eqAsset.equals(assetInList, asset))
      )
    )
  )

export const getWalletBalanceByAssetAndWalletType = ({
  oWalletBalances,
  asset,
  walletType
}: {
  oWalletBalances: O.Option<NonEmptyWalletBalances>
  asset: Asset
  walletType: WalletType
}): O.Option<WalletBalance> =>
  FP.pipe(
    oWalletBalances,
    O.chain((walletBalances) =>
      FP.pipe(
        walletBalances,
        A.findFirst(
          ({ asset: assetInList, walletType: balanceWalletType }) =>
            eqAsset.equals(assetInList, asset) && eqWalletType.equals(walletType, balanceWalletType)
        )
      )
    )
  )

export const getWalletBalanceByAddress = (
  balances: NonEmptyWalletBalances,
  address: Address
): O.Option<WalletBalance> =>
  FP.pipe(
    balances,
    A.findFirst(({ walletAddress: addressInList }) => eqAddress.equals(addressInList, address))
  )

export const getWalletBalanceByAddressAndAsset = ({
  balances,
  address,
  asset
}: {
  balances: NonEmptyWalletBalances
  address: Address
  asset: Asset
}): O.Option<WalletBalance> =>
  FP.pipe(
    balances,
    A.findFirst(
      ({ walletAddress: addressInList, asset: assetInList }) =>
        eqAddress.equals(addressInList, address) && eqAddress.equals(assetInList.ticker, asset.ticker)
    )
  )

export const getWalletAssetAmountFromBalances =
  (isTargetWalletBalance: FP.Predicate<WalletBalance>) =>
  (balances: WalletBalances): O.Option<AssetAmount> =>
    FP.pipe(
      balances,
      A.findFirst(isTargetWalletBalance),
      O.map(({ amount }) => baseToAsset(amount)),
      O.alt(() => O.some(ZERO_ASSET_AMOUNT))
    )

export const getAssetAmountFromBalances = (
  balances: WalletBalances,
  isAsset: (asset: Asset) => boolean
): O.Option<AssetAmount> =>
  FP.pipe(
    balances,
    A.findFirst(({ asset }) => isAsset(asset)),
    O.map(({ amount }) => baseToAsset(amount))
  )

export const getBnbAmountFromBalances = (balances: WalletBalances): O.Option<AssetAmount> =>
  getAssetAmountFromBalances(balances, isBnbAsset)

export const getEthAmountFromBalances = (balances: WalletBalances): O.Option<AssetAmount> =>
  getAssetAmountFromBalances(balances, isEthAsset)

export const getLtcAmountFromBalances = (balances: WalletBalances): O.Option<AssetAmount> =>
  getAssetAmountFromBalances(balances, isLtcAsset)

export const getRuneNativeAmountFromBalances = (balances: WalletBalances): O.Option<AssetAmount> =>
  getAssetAmountFromBalances(balances, isRuneNativeAsset)

export const filterWalletBalancesByAssets = (balances: NonEmptyWalletBalances, assets: Asset[]): WalletBalances => {
  return balances.filter((balance) => assets.findIndex((asset) => eqAsset.equals(asset, balance.asset)) >= 0)
}

export const addressFromWalletAddress = ({ address }: Pick<WalletAddress, 'address'>): Address => address

export const addressFromOptionalWalletAddress = (
  oWalletAddress: O.Option<Pick<WalletAddress, 'address'>>
): O.Option<Address> => FP.pipe(oWalletAddress, O.map(addressFromWalletAddress))

export const getAddressFromBalancesByChain = ({
  balances,
  chain,
  walletType
}: {
  balances: NonEmptyWalletBalances
  chain: Chain
  walletType: WalletType
}): O.Option<Address> =>
  FP.pipe(
    balances,
    A.findFirst(
      ({ asset, walletType: balanceWalletType }) =>
        eqChain.equals(chain, asset.chain) && eqWalletType.equals(walletType, balanceWalletType)
    ),
    O.map(({ walletAddress }) => walletAddress)
  )

export const getWalletByAddress = (walletBalances: WalletBalances, address: Address): O.Option<WalletBalance> =>
  FP.pipe(
    walletBalances,
    A.findFirst(({ walletAddress }) => eqAddress.equals(walletAddress, address))
  )

export const isLedgerAddressInBalances = ({
  balances,
  address,
  asset
}: {
  balances: WalletBalances
  address: Address
  asset: Asset
}): boolean =>
  FP.pipe(
    NEA.fromArray(balances),
    O.chain((balances) => getWalletBalanceByAddressAndAsset({ balances, address, asset })),
    O.fold(
      () => false,
      ({ walletType }) => isLedgerWallet(walletType)
    )
  )
