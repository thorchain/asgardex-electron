import React from 'react'

import { storiesOf } from '@storybook/react'

import AccountSelector from './AccountSelector'

storiesOf('Wallet/AccountSelector', module).add('default', () => {
  return <AccountSelector />
})
