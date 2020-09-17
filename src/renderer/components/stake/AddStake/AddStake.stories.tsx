import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetAmount, assetToBase } from '@thorchain/asgardex-util'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AddStake } from './AddStake'

export const AddStakeStory = () => {
  return (
    <AddStake
      asset={ASSETS_MAINNET.BOLT}
      runeAsset={ASSETS_MAINNET.RUNE}
      assetPrice={bn(600)}
      runePrice={bn(600)}
      assetAmount={assetToBase(assetAmount(1.354))}
      runeAmount={assetToBase(assetAmount(1.354))}
    />
  )
}

storiesOf('Components/Stake/AddStake', module).add('default', AddStakeStory)
