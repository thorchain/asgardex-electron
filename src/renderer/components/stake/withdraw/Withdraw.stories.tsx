import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetBNB, AssetRune67C } from '@thorchain/asgardex-util'

import { Withdraw } from './Withdraw'

export const WithdrawStory = () => {
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
      onWithdraw={console.log}
    />
  )
}

storiesOf('Components/Stake/Withdraw', module).add('default', WithdrawStory)
