import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { BaseStory } from '@storybook/addons'
import { assetAmount, AssetBNB, AssetRune67C, assetToBase } from '@xchainjs/xchain-util'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'

import { ZERO_BASE_AMOUNT } from '../../../const'
import { SendTxParams } from '../../../services/binance/types'
import { WalletBalance, WalletBalances } from '../../../types/wallet'
import { AssetDetails } from './index'

const bnbBalance: WalletBalance = {
  asset: AssetBNB,
  amount: assetToBase(assetAmount(1.1)),
  walletAddress: 'BNB address'
}

const runeBalance: WalletBalance = {
  asset: AssetRune67C,
  amount: assetToBase(assetAmount(2.2)),
  walletAddress: 'Rune address'
}

const runeBalanceEmpty: WalletBalance = { ...runeBalance, amount: ZERO_BASE_AMOUNT }
const getBalances = (balances: WalletBalances) => NEA.fromArray<WalletBalance>(balances)
const balances = getBalances([bnbBalance, runeBalance])

const upgradeRuneHandler = (p: SendTxParams) => console.log('Upgrade', p)
const poolAddress = O.some('pool address')

export const Story1: BaseStory<never, JSX.Element> = () => (
  <AssetDetails
    txsPageRD={RD.initial}
    balances={balances}
    asset={O.some(AssetBNB)}
    upgradeRuneHandler={upgradeRuneHandler}
    poolAddress={poolAddress}
  />
)
Story1.storyName = 'BNB'

export const Story2: BaseStory<never, JSX.Element> = () => (
  <AssetDetails
    txsPageRD={RD.initial}
    balances={balances}
    asset={O.some(AssetRune67C)}
    upgradeRuneHandler={upgradeRuneHandler}
    poolAddress={poolAddress}
  />
)
Story2.storyName = 'RUNE'

export const Story3: BaseStory<never, JSX.Element> = () => (
  <AssetDetails
    txsPageRD={RD.initial}
    balances={getBalances([runeBalanceEmpty])}
    asset={O.some(AssetRune67C)}
    upgradeRuneHandler={upgradeRuneHandler}
    poolAddress={poolAddress}
  />
)
Story3.storyName = 'RUNE - disabled - no balance'

export default {
  title: 'Wallet/AssetsDetails'
}
