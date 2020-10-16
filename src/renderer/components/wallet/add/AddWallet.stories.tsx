import React from 'react'

import { storiesOf } from '@storybook/react'

import { AddWallet } from './index'

storiesOf('Wallet/AddWallet', module)
  .add('connect', () => <AddWallet />)
  .add('unlock', () => <AddWallet isLocked={true} />)
