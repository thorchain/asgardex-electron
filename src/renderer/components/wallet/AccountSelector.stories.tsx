import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn } from '@thorchain/asgardex-util'

import { ASSETS_MAINNET } from '../../../shared/mock/assets'
import AccountSelector from './AccountSelector'

storiesOf('Wallet/AccountSelector', module).add('default', () => {
  return (
    <AccountSelector
      asset={ASSETS_MAINNET.BOLT}
      assets={[ASSETS_MAINNET.BNB, ASSETS_MAINNET.TOMO].map((asset) => ({ ...asset, balance: bn(1) }))}
    />
  )
})
