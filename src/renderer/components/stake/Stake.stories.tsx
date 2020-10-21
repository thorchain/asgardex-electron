import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetBNB } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { getDefaultRuneAsset } from '../../helpers/assetHelper'
import { DefaultPoolShare } from '../uielements/poolShare/PoolShare.stories'
import { AddSymStakeStory } from './add/AddStake.stories'
import { Stake } from './Stake'
import { WithdrawStory } from './withdraw/Withdraw.stories'

storiesOf('Stake', module)
  .add('default', () => {
    return (
      <Stake
        runeAsset={getDefaultRuneAsset()}
        asset={AssetBNB}
        ShareContent={DefaultPoolShare}
        StakeContent={AddSymStakeStory}
        WidthdrawContent={(props) => <WithdrawStory {...props} />}
        keystoreState={O.some(O.some({ phrase: 'phrase' }))}
      />
    )
  })
  .add('no wallet', () => {
    return (
      <Stake
        runeAsset={getDefaultRuneAsset()}
        asset={AssetBNB}
        ShareContent={DefaultPoolShare}
        StakeContent={AddSymStakeStory}
        WidthdrawContent={(props) => <WithdrawStory {...props} />}
        keystoreState={O.none}
      />
    )
  })
  .add('locked', () => {
    return (
      <Stake
        runeAsset={getDefaultRuneAsset()}
        asset={AssetBNB}
        ShareContent={DefaultPoolShare}
        StakeContent={AddSymStakeStory}
        WidthdrawContent={(props) => <WithdrawStory {...props} />}
        keystoreState={O.some(O.none)}
      />
    )
  })
