import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetRune67C, AssetBNB } from '@thorchain/asgardex-util'

import { WithdrawStake } from '../withdraw/WithdrawStake'

export const WithdrawStakeStory = () => {
  return <WithdrawStake asset={AssetBNB} runeAsset={AssetRune67C} />
}

storiesOf('Components/Stake/WitdrawStake', module).add('default', WithdrawStakeStory)
