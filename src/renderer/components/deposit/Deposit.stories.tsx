import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetBNB } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { DefaultPoolShare } from '../uielements/poolShare/PoolShare.stories'
import { AddSymDepositStory } from './add/AddDeposit.stories'
import { Deposit } from './Deposit'
import { WithdrawStory } from './withdraw/Withdraw.stories'

storiesOf('Deposit', module)
  .add('default', () => {
    return (
      <Deposit
        asset={AssetBNB}
        ShareContent={DefaultPoolShare}
        DepositContent={AddSymDepositStory}
        WidthdrawContent={(props) => <WithdrawStory {...props} />}
        keystoreState={O.some(O.some({ phrase: 'phrase' }))}
      />
    )
  })
  .add('no wallet', () => {
    return (
      <Deposit
        asset={AssetBNB}
        ShareContent={DefaultPoolShare}
        DepositContent={AddSymDepositStory}
        WidthdrawContent={(props) => <WithdrawStory {...props} />}
        keystoreState={O.none}
      />
    )
  })
  .add('locked', () => {
    return (
      <Deposit
        asset={AssetBNB}
        ShareContent={DefaultPoolShare}
        DepositContent={AddSymDepositStory}
        WidthdrawContent={(props) => <WithdrawStory {...props} />}
        keystoreState={O.some(O.none)}
      />
    )
  })
