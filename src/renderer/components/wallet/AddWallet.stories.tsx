import React from 'react'

import { storiesOf } from '@storybook/react'

import { AddWallet } from './AddWallet'

storiesOf('Wallet/AddWallet', module)
  .add('connect', () => <AddWallet />)
  .add('unlock', () => <AddWallet isLocked={true} />)
