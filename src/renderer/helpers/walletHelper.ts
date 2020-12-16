import { Asset, AssetAmount, baseToAsset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { WalletBalances } from '../services/clients'
import { NonEmptyWalletBalances } from '../services/wallet/types'
import { WalletBalance } from '../types/wallet'
import { isBnbAsset, isRuneNativeAsset } from './assetHelper'
import { eqAsset } from './fp/eq'
import { sequenceTOption } from './fpHelpers'

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
  oAsset: O.Option<Asset>
): O.Option<WalletBalance> =>
  FP.pipe(
    sequenceTOption(oWalletBalances, oAsset),
    O.chain(([walletBalances, asset]) =>
      FP.pipe(
        walletBalances,
        A.findFirst(({ asset: assetInList }) => assetInList.symbol === asset.symbol)
      )
    )
  )

export const getBnbAmountFromBalances = (balances: WalletBalances): O.Option<AssetAmount> =>
  FP.pipe(
    balances,
    A.findFirst(({ asset }) => isBnbAsset(asset)),
    O.map(({ amount }) => baseToAsset(amount))
  )

export const getRuneNativeAmountFromBalances = (balances: WalletBalances): O.Option<AssetAmount> =>
  FP.pipe(
    balances,
    A.findFirst(({ asset }) => isRuneNativeAsset(asset)),
    O.map(({ amount }) => baseToAsset(amount))
  )
