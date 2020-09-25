import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetBNB } from '@thorchain/asgardex-util'

import { DefaultPoolShare } from '../uielements/poolShare/PoolShare.stories'
import { AddStakeStory } from './AddStake/AddStake.stories'
import { PoolDetailsStory } from './PoolDetails/PoolDetails.stories'
import { Stake } from './Stake'

storiesOf('Stake', module).add('default', () => {
  return (
    <Stake asset={AssetBNB} TopContent={PoolDetailsStory} ShareContent={DefaultPoolShare} AddStake={AddStakeStory} />
  )
})
