import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { Asset, assetAmount, AssetBNB, AssetRune67C, assetToBase, baseAmount, bn } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { emptyFunc } from '../../../helpers/funcHelper'
import { Withdraw } from './Withdraw'

const chainAssetBalance = O.some(assetToBase(assetAmount(200)))
const runeBalance = O.some(assetToBase(assetAmount(100)))

export const WithdrawStory: React.FC<{ stakedAsset?: Asset; runeAsset?: Asset }> = () => {
  return (
    <Withdraw
      type={'asym'}
      fees={RD.initial}
      asset={AssetBNB}
      assetPrice={bn(60.972)}
      runePrice={bn(1)}
      chainAssetBalance={chainAssetBalance}
      runeBalance={runeBalance}
      selectedCurrencyAsset={AssetRune67C}
      onWithdraw={console.log}
      runeShare={baseAmount('193011422')}
      assetShare={baseAmount('3202499')}
      updateFees={emptyFunc}
    />
  )
}

storiesOf('Components/Deposit/Withdraw', module)
  .add('asym', () => <WithdrawStory />)
  .add('sym - fee error', () => {
    return (
      <Withdraw
        type={'asym'}
        fees={RD.failure(new Error('no fees'))}
        asset={AssetBNB}
        assetPrice={bn(60.972)}
        runePrice={bn(1)}
        chainAssetBalance={chainAssetBalance}
        runeBalance={runeBalance}
        selectedCurrencyAsset={AssetRune67C}
        onWithdraw={console.log}
        runeShare={baseAmount('193011422')}
        assetShare={baseAmount('3202499')}
        updateFees={emptyFunc}
      />
    )
  })
  .add('sym - thor (memo) fee / balance error', () => {
    return (
      <Withdraw
        type={'asym'}
        fees={RD.success({ thorMemo: baseAmount(1000), thorOut: baseAmount(3000), assetOut: baseAmount(3000) })}
        asset={AssetBNB}
        assetPrice={bn(60.972)}
        runePrice={bn(1)}
        chainAssetBalance={chainAssetBalance}
        runeBalance={O.none}
        selectedCurrencyAsset={AssetRune67C}
        onWithdraw={console.log}
        runeShare={baseAmount('193011422')}
        assetShare={baseAmount('3202499')}
        updateFees={emptyFunc}
      />
    )
  })
