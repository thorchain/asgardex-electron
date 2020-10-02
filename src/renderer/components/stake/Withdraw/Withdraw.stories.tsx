import React from 'react'
import { Withdraw } from './Withdraw'

import { storiesOf } from '@storybook/react'
import { AssetBNB, AssetRune67C, baseAmount, bn } from '@thorchain/asgardex-util'

export const WithdrawStory = () => {
  return (
    <Withdraw
      runeStakedAmount={baseAmount(bn(0))}
      assetStakedAmount={baseAmount(bn(0))}
      stakedAsset={AssetBNB}
      runeAsset={AssetRune67C}
      onWithdraw={() => null}
    />
  )
}

storiesOf('Components/Stake/Withdraw', module).add('default', WithdrawStory)
