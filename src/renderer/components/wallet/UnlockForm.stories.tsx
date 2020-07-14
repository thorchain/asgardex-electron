import React from 'react'

import { storiesOf } from '@storybook/react'
import { none } from 'fp-ts/lib/Option'

import UnlockForm from './UnlockForm'

storiesOf('Wallet/UnlockForm', module).add('default', () => {
  return <UnlockForm keystore={none} />
})
