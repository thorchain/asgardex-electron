import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { Asset, AssetBNB, AssetRune67C, baseAmount, bn } from '@xchainjs/xchain-util'

import { emptyFunc } from '../../../helpers/funcHelper'
import { Withdraw } from './Withdraw'

export const WithdrawStory: React.FC<{ stakedAsset?: Asset; runeAsset?: Asset }> = (props) => {
  return (
    <Withdraw
      fee={RD.initial}
      depositAsset={AssetBNB}
      runeAsset={AssetRune67C}
      assetPrice={bn(60.972)}
      runePrice={bn(1)}
      selectedCurrencyAsset={AssetRune67C}
      onWithdraw={console.log}
      runeShare={baseAmount('193011422')}
      assetShare={baseAmount('3202499')}
      updateFees={emptyFunc}
      {...props}
    />
  )
}

storiesOf('Components/Deposit/Withdraw', module).add('default', () => <WithdrawStory />)
