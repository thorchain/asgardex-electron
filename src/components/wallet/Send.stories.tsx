import React from 'react'

import { storiesOf } from '@storybook/react'

import Send from './Send'

storiesOf('Wallet/Send', module).add('default', () => {
  return <Send />
})
