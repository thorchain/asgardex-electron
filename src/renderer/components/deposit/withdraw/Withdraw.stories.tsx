import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { BaseStory } from '@storybook/addons'
import {
  Asset,
  assetAmount,
  AssetBNB,
  AssetBTC,
  AssetRuneNative,
  assetToBase,
  baseAmount,
  bn
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { ZERO_POOL_DATA } from '../../../const'
import { emptyFunc } from '../../../helpers/funcHelper'
import { Withdraw } from './Withdraw'

const runeBalance = O.some(assetToBase(assetAmount(100)))

const assetPoolData = {
  assetBalance: baseAmount('1000'),
  runeBalance: baseAmount('2000')
}

const chainAssetPoolData = {
  assetBalance: baseAmount('1000'),
  runeBalance: baseAmount('2000')
}

export const WithdrawStory: BaseStory<{ asset?: Asset }, JSX.Element> = () => (
  <Withdraw
    type={'asym'}
    fees={RD.success({ thorMemo: baseAmount(1000), thorOut: baseAmount(3000), assetOut: baseAmount(3000) })}
    asset={AssetBNB}
    assetPoolData={assetPoolData}
    assetPrice={bn(60.972)}
    chainAssetPoolData={chainAssetPoolData}
    runePrice={bn(1)}
    runeBalance={runeBalance}
    selectedPriceAsset={AssetRuneNative}
    onWithdraw={console.log}
    runeShare={baseAmount('193011422')}
    assetShare={baseAmount('3202499')}
    reloadFees={emptyFunc}
  />
)
WithdrawStory.storyName = 'asym'

export const AsymErrorNoFeesStory: BaseStory<never, JSX.Element> = () => (
  <Withdraw
    type={'asym'}
    fees={RD.failure(new Error('no fees'))}
    asset={AssetBNB}
    assetPoolData={ZERO_POOL_DATA}
    assetPrice={bn(60.972)}
    runePrice={bn(1)}
    chainAssetPoolData={ZERO_POOL_DATA}
    runeBalance={runeBalance}
    selectedPriceAsset={AssetRuneNative}
    onWithdraw={console.log}
    runeShare={baseAmount('193011422')}
    assetShare={baseAmount('3202499')}
    reloadFees={emptyFunc}
  />
)
AsymErrorNoFeesStory.storyName = 'asym - error: no fee'

export const AsymErrorThorMemoFeeStory: BaseStory<never, JSX.Element> = () => (
  <Withdraw
    type={'asym'}
    fees={RD.success({ thorMemo: baseAmount(1000), thorOut: baseAmount(3000), assetOut: baseAmount(3000) })}
    asset={AssetBNB}
    assetPoolData={ZERO_POOL_DATA}
    assetPrice={bn(60.972)}
    runePrice={bn(1)}
    chainAssetPoolData={ZERO_POOL_DATA}
    runeBalance={O.none}
    selectedPriceAsset={AssetRuneNative}
    onWithdraw={console.log}
    runeShare={baseAmount('193011422')}
    assetShare={baseAmount('3202499')}
    reloadFees={emptyFunc}
  />
)
AsymErrorThorMemoFeeStory.storyName = 'asym - error: thorMemo fee'

export const AsymErrorThorOutFeeStory: BaseStory<never, JSX.Element> = () => (
  <Withdraw
    type={'asym'}
    fees={RD.success({ thorMemo: baseAmount(1000), thorOut: baseAmount(6000000), assetOut: baseAmount(300) })}
    asset={AssetBTC}
    assetPoolData={assetPoolData}
    assetPrice={bn(20)}
    runePrice={bn(1)}
    chainAssetPoolData={chainAssetPoolData}
    runeBalance={O.some(baseAmount('100000000000'))}
    selectedPriceAsset={AssetRuneNative}
    onWithdraw={console.log}
    runeShare={baseAmount('10000000')}
    assetShare={baseAmount('300000000')}
    reloadFees={emptyFunc}
  />
)
AsymErrorThorOutFeeStory.storyName = 'asym - error: thorOut fee'

export const AsymErrorAssetOutFeeStory: BaseStory<never, JSX.Element> = () => (
  <Withdraw
    type={'asym'}
    fees={RD.success({ thorMemo: baseAmount(1000), thorOut: baseAmount(10000), assetOut: baseAmount(3000000) })}
    asset={AssetBTC}
    assetPoolData={{
      assetBalance: assetToBase(assetAmount('100')),
      runeBalance: assetToBase(assetAmount('200000'))
    }}
    assetPrice={bn(20)}
    runePrice={bn(1)}
    chainAssetPoolData={chainAssetPoolData}
    runeBalance={O.some(baseAmount('100000000000'))}
    selectedPriceAsset={AssetRuneNative}
    onWithdraw={console.log}
    runeShare={baseAmount('10000000')}
    assetShare={baseAmount('3000000')}
    reloadFees={emptyFunc}
  />
)
AsymErrorAssetOutFeeStory.storyName = 'asym - error: assetOut fee'

export const AsymErrorAllFeesStory: BaseStory<never, JSX.Element> = () => (
  <Withdraw
    type={'asym'}
    fees={RD.success({ thorMemo: baseAmount(1000), thorOut: baseAmount(100000000), assetOut: baseAmount(3000000) })}
    asset={AssetBTC}
    assetPoolData={{
      assetBalance: assetToBase(assetAmount('100')),
      runeBalance: assetToBase(assetAmount('200000'))
    }}
    assetPrice={bn(20)}
    runePrice={bn(1)}
    chainAssetPoolData={chainAssetPoolData}
    runeBalance={O.none}
    selectedPriceAsset={AssetRuneNative}
    onWithdraw={console.log}
    runeShare={baseAmount('10000000')}
    assetShare={baseAmount('3000000')}
    reloadFees={emptyFunc}
  />
)
AsymErrorAllFeesStory.storyName = 'asym - error: all fees'

export default {
  title: 'Components/Deposit/Withdraw'
}
