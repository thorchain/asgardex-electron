import React from 'react'

import { storiesOf } from '@storybook/react'

import SendForm from './SendForm'

storiesOf('Wallet/Send', module).add('default', () => {
  return <SendForm />
})
