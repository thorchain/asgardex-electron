import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetBNB } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { DefaultPoolShare } from '../uielements/poolShare/PoolShare.stories'
import { AddSymStakeStory } from './add/AddStake.stories'
import { Stake } from './Stake'
import { WithdrawStakeStory } from './withdraw/WithdrawStake.stories'

storiesOf('Stake', module)
  .add('default', () => {
    return (
      <Stake
        asset={AssetBNB}
        ShareContent={DefaultPoolShare}
        StakeContent={AddSymStakeStory}
        WidthdrawContent={WithdrawStakeStory}
        keystoreState={O.some(O.some({ phrase: 'phrase' }))}
      />
    )
  })
  .add('no wallet', () => {
    return (
      <Stake
        asset={AssetBNB}
        ShareContent={DefaultPoolShare}
        StakeContent={AddSymStakeStory}
        WidthdrawContent={WithdrawStakeStory}
        keystoreState={O.none}
      />
    )
  })
  .add('locked', () => {
    return (
      <Stake
        asset={AssetBNB}
        ShareContent={DefaultPoolShare}
        StakeContent={AddSymStakeStory}
        WidthdrawContent={WithdrawStakeStory}
        keystoreState={O.some(O.none)}
      />
    )
  })
