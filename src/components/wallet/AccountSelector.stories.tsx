import React from 'react'

import { storiesOf } from '@storybook/react'

import { ASSETS_MAINNET } from '../../mock/assets'
import AccountSelector from './AccountSelector'

storiesOf('Wallet/AccountSelector', module).add('default', () => {
  return <AccountSelector asset={ASSETS_MAINNET.BOLT} assets={[ASSETS_MAINNET.BNB, ASSETS_MAINNET.TOMO]} />
})
