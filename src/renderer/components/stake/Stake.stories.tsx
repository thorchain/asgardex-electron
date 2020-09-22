import React from 'react'

import { storiesOf } from '@storybook/react'

import { defaultPoolShare } from '../uielements/poolShare/PoolShare.stories'
import { AddStakeStory } from './AddStake/AddStake.stories'
import { PoolDetailsStory } from './PoolDetails/PoolDetails.stories'
import { Stake } from './Stake'

storiesOf('Stake', module).add('default', () => {
  return <Stake topContent={<PoolDetailsStory />} shareContent={defaultPoolShare} AddStake={AddStakeStory} />
})
