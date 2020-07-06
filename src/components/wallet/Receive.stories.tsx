import React from 'react'

import { storiesOf } from '@storybook/react'

import Receive from './Receive'

storiesOf('Wallet/Receive', module).add('default', () => {
  return <Receive />
})
