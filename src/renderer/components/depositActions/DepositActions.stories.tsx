import React from 'react'

import { storiesOf } from '@storybook/react'
// import { AssetRuneNative } from '@xchainjs/xchain-util'
// import * as O from 'fp-ts/lib/Option'

// import { DefaultPoolShare } from '../uielements/poolShare/PoolShare.stories'
// import { SymDeposit } from './add/AddDeposit.stories'
import { DepositActions } from './DepositActions'
// import { WithdrawStory } from './withdraw/Withdraw.stories'

storiesOf('DepositActions', module).add('default', () => {
  return <DepositActions />
})
// .add('no wallet', () => {
//   return (
//     <Deposit
//       asset={AssetBNB}
//       ShareContent={DefaultPoolShare}
//       DepositContent={SymDeposit}
//       WidthdrawContent={(props) => <WithdrawStory {...props} />}
//       keystoreState={O.none}
//     />
//   )
// })
// .add('locked', () => {
//   return (
//     <Deposit
//       asset={AssetBNB}
//       ShareContent={DefaultPoolShare}
//       DepositContent={SymDeposit}
//       WidthdrawContent={(props) => <WithdrawStory {...props} />}
//       keystoreState={O.some(O.none)}
//     />
//   )
// })
