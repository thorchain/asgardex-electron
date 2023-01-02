import { Address } from '@xchainjs/xchain-util'
import { Asset, AssetAmount, baseToAsset } from '@xchainjs/xchain-util'
import { Chain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { IntlShape } from 'react-intl'

import { Network } from '../../shared/api/types'
import { optionFromNullableString } from '../../shared/utils/fp'
import { isLedgerWallet, isWalletType } from '../../shared/utils/guard'
import { WalletAddress, WalletType } from '../../shared/wallet/types'
import { ZERO_ASSET_AMOUNT } from '../const'
import { WalletBalances } from '../services/clients'
import { NonEmptyWalletBalances, WalletBalance } from '../services/wallet/types'
import { isBnbAsset, isEthAsset, isLtcAsset, isRuneNativeAsset } from './assetHelper'
import { isBchChain, isDogeChain, isLtcChain, isThorChain } from './chainHelper'
import { eqAddress, eqAsset, eqWalletType } from './fp/eq'

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
  (isTargetWalletBalance: (wb: WalletBalance) => boolean) =>
  (balances: WalletBalances): O.Option<AssetAmount> =>
    FP.pipe(
      balances,
      A.findFirst(isTargetWalletBalance),
      O.map(({ amount }) => baseToAsset(amount)),
      O.alt(() => O.some(ZERO_ASSET_AMOUNT))
    )

// TODO (@asgdx-team) Add tests
export const hasLedgerInBalancesByAsset = (asset: Asset, balances: WalletBalances): boolean =>
  FP.pipe(
    balances,
    A.findFirst(
      ({ walletType, asset: balanceAsset }) => eqAsset.equals(asset, balanceAsset) && isLedgerWallet(walletType)
    ),
    O.fold(
      () => false,
      () => true
    )
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

export const getWalletByAddress = (walletBalances: WalletBalances, address: Address): O.Option<WalletBalance> =>
  FP.pipe(
    walletBalances,
    A.findFirst(({ walletAddress }) => eqAddress.equals(walletAddress, address))
  )

export const isEnabledLedger = (chain: Chain, network: Network) => {
  // Disable THORChain ledger wallets in stagenet
  if (isThorChain(chain) && network === 'stagenet') return false
  // Disable LTC ledger wallets in testnet
  // It seems Ledger can not derive LTC addresses on Testnet properly
  if (isLtcChain(chain) && network === 'testnet') return false
  // Same for BCH - no Ledger support for `testnet`
  if (isBchChain(chain) && network === 'testnet') return false
  // No DOGE support on `testnet`
  if (isDogeChain(chain) && network === 'testnet') return false
  return true
}

export const getWalletAddressFromNullableString = (s?: string): O.Option<Address> =>
  FP.pipe(s, optionFromNullableString, O.chain(O.fromPredicate((s) => s.length > 0)))

// TODO (@veado) Use `naturalNumberFromNullableString` from `shared/utils/fp`
export const getWalletIndexFromNullableString = (s?: string): O.Option<number /* positive integer */> =>
  FP.pipe(s, optionFromNullableString, O.map(parseInt), O.chain(O.fromPredicate((v) => !isNaN(v) && v >= 0)))

export const getWalletTypeFromNullableString = (s?: string): O.Option<WalletType> =>
  FP.pipe(s, optionFromNullableString, O.chain(O.fromPredicate(isWalletType)))

export const getWalletNamesFromKeystoreWallets = (wallets: Array<Required<{ name: string }>>) =>
  FP.pipe(
    wallets,
    A.map(({ name }) => name)
  )

export const getWalletTypeLabel = (oWalletType: O.Option<WalletType>, intl: IntlShape) => {
  const id = FP.pipe(
    oWalletType,
    O.map((walletType) => {
      switch (walletType) {
        case 'keystore':
          return 'common.keystore'
        case 'ledger':
          return 'common.ledger'
        default:
          return 'common.custom'
      }
    }),
    O.getOrElse(() => 'common.custom')
  )
  return intl.formatMessage({ id })
}
