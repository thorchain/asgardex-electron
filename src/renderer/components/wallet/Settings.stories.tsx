import React from 'react'

import { storiesOf } from '@storybook/react'
import { some } from 'fp-ts/lib/Option'

import { WALLET_ADDRESS_TESTNET } from '../../../shared/mock/address'
import Settings from './Settings'

storiesOf('Wallet/Settings', module).add('default', () => {
  return (
    <Settings
      network={'testnet'}
      toggleNetwork={() => console.log('toggle network')}
      clientUrl={some(WALLET_ADDRESS_TESTNET)}
      lockWallet={() => console.log('lock')}
      removeKeystore={() => console.log('removeKeystore')}
    />
  )
})
