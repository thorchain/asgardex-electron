import React from 'react'

import { storiesOf } from '@storybook/react'
import { some } from 'fp-ts/lib/Option'

import { Network } from '../../services/app/types'
import Settings from './Settings'

storiesOf('Wallet/Settings', module).add('default', () => {
  return (
    <Settings
      network={Network.TEST}
      toggleNetwork={() => console.log('toggle network')}
      address={some('tbnb1vxutrxadm0utajduxfr6wd9kqfalv0dg2wnx5y')}
      lockWallet={() => console.log('lock')}
      removeKeystore={() => console.log('removeKeystore')}
    />
  )
})
