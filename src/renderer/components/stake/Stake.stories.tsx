import React from 'react'

import { storiesOf } from '@storybook/react'

import { defaultPoolShare } from '../uielements/poolShare/PoolShare.stories'
import { AddStakeStory } from './AddStake/AddStake.stories'
import { Stake } from './Stake'

storiesOf('Stake', module).add('default', () => {
  return <Stake topContent={'TopContainer'} shareContent={defaultPoolShare} AddStake={AddStakeStory} />
})
