import React from 'react'

import { storiesOf } from '@storybook/react'
import { Asset, AssetBNB, AssetCurrencySymbol, AssetRune67C, bn } from '@thorchain/asgardex-util'

import { Withdraw } from './Withdraw'

export const WithdrawStory: React.FC<{ stakedAsset?: Asset; runeAsset?: Asset }> = (props) => {
  return (
    <Withdraw
      stakersAssetData={{
        asset: 'BNB.BNB',
        assetStaked: '2959329',
        assetWithdrawn: '0',
        dateFirstStaked: 1600943752,
        heightLastStaked: 512555,
        runeStaked: '200000000',
        runeWithdrawn: '0',
        units: '71862938'
      }}
      poolDetail={{
        poolUnits: '178806928424995',
        runeDepth: '480244483866649',
        assetDepth: '7968349234845',
        asset: 'BNB.BNB'
      }}
      stakedAsset={AssetBNB}
      runeAsset={AssetRune67C}
      assetPrice={bn(60.972)}
      runePrice={bn(1)}
      currencySymbol={AssetCurrencySymbol.RUNE}
      onWithdraw={console.log}
      {...props}
    />
  )
}

storiesOf('Components/Stake/Withdraw', module).add('default', () => <WithdrawStory />)
