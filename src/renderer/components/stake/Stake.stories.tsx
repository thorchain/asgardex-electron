import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetBNB } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { DefaultPoolShare } from '../uielements/poolShare/PoolShare.stories'
import { AddStakeStory } from './AddStake/AddStake.stories'
import { Stake } from './Stake'

storiesOf('Stake', module).add('default', () => {
  return <Stake asset={AssetBNB} ShareContent={DefaultPoolShare} AddStake={AddStakeStory} keystoreState={O.none} />
})
