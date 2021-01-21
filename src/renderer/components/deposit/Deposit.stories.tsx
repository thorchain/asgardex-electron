import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetBNB } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { DefaultPoolShare } from '../uielements/poolShare/PoolShare.stories'
import { Default as AsymDeposit } from './add/AsymDeposit.stories'
import { Default as SymDeposit } from './add/SymDeposit.stories'
import { Deposit } from './Deposit'
import { WithdrawStory } from './withdraw/Withdraw.stories'

storiesOf('Deposit', module)
  .add('default', () => {
    return (
      <Deposit
        asset={AssetBNB}
        ShareContent={DefaultPoolShare}
        SymDepositContent={SymDeposit}
        AsymDepositContent={AsymDeposit}
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
        SymDepositContent={SymDeposit}
        AsymDepositContent={AsymDeposit}
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
        SymDepositContent={SymDeposit}
        AsymDepositContent={AsymDeposit}
        WidthdrawContent={(props) => <WithdrawStory {...props} />}
        keystoreState={O.some(O.none)}
      />
    )
  })
