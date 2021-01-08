import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { BaseStory } from '@storybook/addons'
import { assetAmount, AssetBNB, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'

import { ZERO_BASE_AMOUNT } from '../../../const'
import { WalletBalance, WalletBalances } from '../../../types/wallet'
import { AssetDetails } from './index'

const bnbBalance: WalletBalance = {
  asset: AssetBNB,
  amount: assetToBase(assetAmount(1.1)),
  walletAddress: 'BNB address'
}

const runeNativeBalance: WalletBalance = {
  asset: AssetRuneNative,
  amount: assetToBase(assetAmount(0)),
  walletAddress: 'Rune native address'
}

const bnbBalanceEmpty: WalletBalance = { ...bnbBalance, amount: ZERO_BASE_AMOUNT }
const getBalances = (balances: WalletBalances) => NEA.fromArray<WalletBalance>(balances)
const balances = getBalances([bnbBalance, runeNativeBalance])

export const StoryBNB: BaseStory<never, JSX.Element> = () => (
  <AssetDetails txsPageRD={RD.initial} balances={balances} asset={O.some(AssetBNB)} />
)
StoryBNB.storyName = 'BNB'

export const StoryBnbTxSuccess: BaseStory<never, JSX.Element> = () => (
  <AssetDetails txsPageRD={RD.initial} balances={balances} asset={O.some(AssetBNB)} />
)
StoryBnbTxSuccess.storyName = 'BNB - tx success'

export const StoryBnbTxError: BaseStory<never, JSX.Element> = () => (
  <AssetDetails txsPageRD={RD.initial} balances={balances} asset={O.some(AssetBNB)} />
)
StoryBnbTxError.storyName = 'BNB - tx error'

export const StoryBnbNoBalances: BaseStory<never, JSX.Element> = () => (
  <AssetDetails txsPageRD={RD.initial} balances={getBalances([bnbBalance])} asset={O.some(AssetBNB)} />
)
StoryBnbNoBalances.storyName = 'BNB - disabled - no balance'

export const StoryBnbFeeNotCovered: BaseStory<never, JSX.Element> = () => (
  <AssetDetails txsPageRD={RD.initial} balances={getBalances([bnbBalanceEmpty])} asset={O.some(AssetBNB)} />
)
StoryBnbFeeNotCovered.storyName = 'BNB - fee not covered'

export default {
  title: 'Wallet/AssetsDetails'
}
