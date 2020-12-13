import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { Asset, assetAmount, AssetBNB, AssetRuneNative, assetToBase, baseAmount, bn } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { AssetBUSDBD1, ZERO_POOL_DATA } from '../../../const'
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

export const WithdrawStory: React.FC<{ stakedAsset?: Asset; runeAsset?: Asset }> = () => {
  return (
    <Withdraw
      type={'asym'}
      fees={RD.initial}
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
}

storiesOf('Components/Deposit/Withdraw', module)
  .add('asym', () => <WithdrawStory />)
  .add('sym - error: no fees', () => {
    return (
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
  })
  .add('sym - error: thor memo fees not covered', () => {
    return (
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
  })
  .add('sym - error: thor out fees not covered', () => {
    return (
      <Withdraw
        type={'asym'}
        fees={RD.success({ thorMemo: baseAmount(1000), thorOut: baseAmount(3000), assetOut: baseAmount(3000) })}
        asset={AssetBUSDBD1}
        assetPoolData={assetPoolData}
        assetPrice={bn(60.972)}
        runePrice={bn(1)}
        chainAssetPoolData={chainAssetPoolData}
        runeBalance={O.none}
        selectedPriceAsset={AssetRuneNative}
        onWithdraw={console.log}
        runeShare={baseAmount('193011422')}
        assetShare={baseAmount('3202499')}
        reloadFees={emptyFunc}
      />
    )
  })
