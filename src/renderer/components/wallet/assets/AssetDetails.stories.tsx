import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { BaseStory } from '@storybook/addons'
import { assetAmount, AssetBNB, AssetRune67C, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'
import * as NEA from 'fp-ts/lib/NonEmptyArray'

import { ZERO_BASE_AMOUNT } from '../../../const'
import { WalletBalance, WalletBalances } from '../../../types/wallet'
import { AssetDetails } from './index'

const bnbBalance: WalletBalance = {
  asset: AssetBNB,
  amount: assetToBase(assetAmount(1.1)),
  walletAddress: 'BNB address'
}

const runeBnbBalance: WalletBalance = {
  asset: AssetRune67C,
  amount: assetToBase(assetAmount(2.2)),
  walletAddress: 'BNB.Rune address'
}

const runeNativeBalance: WalletBalance = {
  asset: AssetRuneNative,
  amount: assetToBase(assetAmount(0)),
  walletAddress: 'Rune native address'
}

const runeBalanceEmpty: WalletBalance = { ...runeBnbBalance, amount: ZERO_BASE_AMOUNT }
const bnbBalanceEmpty: WalletBalance = { ...bnbBalance, amount: ZERO_BASE_AMOUNT }
const getBalances = (balances: WalletBalances) => NEA.fromArray<WalletBalance>(balances)
const balances = getBalances([bnbBalance, runeBnbBalance, runeNativeBalance])

export const StoryBNB: BaseStory<never, JSX.Element> = () => (
  <AssetDetails txsPageRD={RD.initial} balances={balances} asset={AssetBNB} network="testnet" />
)
StoryBNB.storyName = 'BNB'

export const StoryRuneTxSuccess: BaseStory<never, JSX.Element> = () => (
  <AssetDetails txsPageRD={RD.initial} balances={balances} asset={AssetRune67C} network="testnet" />
)
StoryRuneTxSuccess.storyName = 'RUNE - tx success'

export const StoryRuneTxError: BaseStory<never, JSX.Element> = () => (
  <AssetDetails txsPageRD={RD.initial} balances={balances} asset={AssetRune67C} network="testnet" />
)
StoryRuneTxError.storyName = 'RUNE - tx error'

export const StoryRuneNoBalances: BaseStory<never, JSX.Element> = () => (
  <AssetDetails
    txsPageRD={RD.initial}
    balances={getBalances([runeBalanceEmpty, bnbBalance])}
    asset={AssetRune67C}
    network="testnet"
  />
)
StoryRuneNoBalances.storyName = 'RUNE - disabled - no balance'

export const StoryRuneFeeNotCovered: BaseStory<never, JSX.Element> = () => (
  <AssetDetails
    txsPageRD={RD.initial}
    balances={getBalances([runeBnbBalance, bnbBalanceEmpty])}
    asset={AssetRune67C}
    network="mainnet"
  />
)
StoryRuneFeeNotCovered.storyName = 'RUNE - fee not covered'

export default {
  title: 'Wallet/AssetsDetails'
}
